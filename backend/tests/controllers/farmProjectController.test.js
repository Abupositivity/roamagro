
jest.mock("../../models/FarmProject", () => ({
    create: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
}));

const FarmProject = require("../../models/FarmProject");
const controller = require("../../controllers/farmProjectController");

const USER_ID = "user-123";
const PROJECT_ID = "project-123";

const makeSubdocuments = (items = [], parent) => {
    const result = items.map((item) => ({ ...item }));

    result.id = jest.fn((id) =>
        result.find((item) => item._id === id) || null
    );

    result.forEach((item) => {
        item.deleteOne = jest.fn(() => {
            const index = result.indexOf(item);
            if (index !== -1) result.splice(index, 1);
        });
    });

    return result;
};

const makeProject = (overrides = {}) => {
    const project = {
        _id: PROJECT_ID,
        user: USER_ID,
        name: "Soybean Farm",
        status: "Active",
        activities: [],
        tasks: [],
        expenses: [],
        harvests: [],
        reminders: [],
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        save: jest.fn().mockResolvedValue(undefined),
        deleteOne: jest.fn().mockResolvedValue(undefined),
        toObject: jest.fn(),
        ...overrides,
    };

    project.activities = makeSubdocuments(project.activities, project);
    project.tasks = makeSubdocuments(project.tasks, project);
    project.expenses = makeSubdocuments(project.expenses, project);
    project.harvests = makeSubdocuments(project.harvests, project);
    project.reminders = makeSubdocuments(project.reminders, project);

    project.toObject.mockImplementation(() => {
        const object = { ...project };
        delete object.save;
        delete object.deleteOne;
        delete object.toObject;

        for (const key of [
            "activities",
            "tasks",
            "expenses",
            "harvests",
            "reminders",
        ]) {
            object[key] = project[key].map((item) => {
                const copy = { ...item };
                delete copy.deleteOne;
                return copy;
            });
        }

        return object;
    });

    return project;
};

const makeResponse = () => {
    const res = {
        statusCode: 200,
        body: undefined,
        status: jest.fn(),
        json: jest.fn(),
    };

    res.status.mockImplementation((statusCode) => {
        res.statusCode = statusCode;
        return res;
    });

    res.json.mockImplementation((body) => {
        res.body = body;
        return res;
    });

    return res;
};

const invoke = async (handler, options = {}) => {
    const req = {
        user: { _id: USER_ID },
        params: { id: PROJECT_ID },
        body: {},
        ...options,
    };

    const res = makeResponse();
    const next = jest.fn();

    await handler(req, res, next);

    return { req, res, next };
};

const mockOwnedProject = (project) => {
    FarmProject.findOne.mockResolvedValue(project);
};

const addItem = (project, collection, item) => {
    project[collection].push(item);
    project[collection] = makeSubdocuments(project[collection], project);
    return project[collection][project[collection].length - 1];
};

beforeEach(() => {
    jest.clearAllMocks();
});

describe("FarmProject controller", () => {
    describe("createFarmProject", () => {
        it("creates a project using the authenticated user's ID", async () => {
            const project = makeProject();
            FarmProject.create.mockResolvedValue(project);

            const { req, res, next } = await invoke(
                controller.createFarmProject,
                {
                    body: { name: "Soybean Farm", user: "attacker-id" },
                }
            );

            expect(next).not.toHaveBeenCalled();
            expect(FarmProject.create).toHaveBeenCalledWith({
                name: "Soybean Farm",
                user: USER_ID,
            });
            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.financials).toEqual({
                income: 0,
                expenses: 0,
                profit: 0,
            });
            expect(res.body.data.progress).toBe(0);
            expect(req.user._id).toBe(USER_ID);
        });

        it("forwards database errors to next", async () => {
            const error = new Error("Database unavailable");
            FarmProject.create.mockRejectedValue(error);

            const { next, res } = await invoke(
                controller.createFarmProject
            );

            expect(next).toHaveBeenCalledWith(error);
            expect(res.body).toBeUndefined();
        });
    });

    describe("getFarmProjects", () => {
        it("returns the user's projects sorted newest first", async () => {
            const projects = [
                makeProject({ _id: "p1", name: "Farm One" }),
                makeProject({ _id: "p2", name: "Farm Two" }),
            ];

            const sort = jest.fn().mockResolvedValue(projects);
            FarmProject.find.mockReturnValue({ sort });

            const { res, next } = await invoke(
                controller.getFarmProjects
            );

            expect(next).not.toHaveBeenCalled();
            expect(FarmProject.find).toHaveBeenCalledWith({
                user: USER_ID,
            });
            expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(res.statusCode).toBe(200);
            expect(res.body.count).toBe(2);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.data[0].financials.profit).toBe(0);
        });

        it("returns an empty list when the user has no projects", async () => {
            FarmProject.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue([]),
            });

            const { res } = await invoke(
                controller.getFarmProjects
            );

            expect(res.body.success).toBe(true);
            expect(res.body.count).toBe(0);
            expect(res.body.data).toEqual([]);
        });

        it("forwards query errors", async () => {
            const error = new Error("Query failed");
            FarmProject.find.mockReturnValue({
                sort: jest.fn().mockRejectedValue(error),
            });

            const { next } = await invoke(
                controller.getFarmProjects
            );

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getFarmProject", () => {
        it("returns the project belonging to the current user", async () => {
            const project = makeProject({
                harvests: [{ totalValue: 500 }],
                expenses: [{ amount: 150 }],
            });
            mockOwnedProject(project);

            const { res, next } = await invoke(
                controller.getFarmProject
            );

            expect(next).not.toHaveBeenCalled();
            expect(FarmProject.findOne).toHaveBeenCalledWith({
                _id: PROJECT_ID,
                user: USER_ID,
            });
            expect(res.statusCode).toBe(200);
            expect(res.body.data.financials).toEqual({
                income: 500,
                expenses: 150,
                profit: 350,
            });
        });

        it("returns 404 when the project is not found or not owned", async () => {
            FarmProject.findOne.mockResolvedValue(null);

            const { res, next } = await invoke(
                controller.getFarmProject
            );

            expect(next).not.toHaveBeenCalled();
            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual({
                success: false,
                message: "Farm project not found.",
            });
        });

        it("forwards database errors", async () => {
            const error = new Error("Read failed");
            FarmProject.findOne.mockRejectedValue(error);

            const { next } = await invoke(
                controller.getFarmProject
            );

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("updateFarmProject", () => {
        it("updates the owned project and recalculates finances and progress", async () => {
            const project = makeProject({
                harvests: [{ totalValue: 900 }],
                expenses: [{ amount: 300 }],
                activities: [{ status: "Completed" }],
                tasks: [{ status: "Pending" }],
            });
            mockOwnedProject(project);

            const { res, next } = await invoke(
                controller.updateFarmProject,
                {
                    body: {
                        name: "Updated Soybean Farm",
                        status: "Completed",
                    },
                }
            );

            expect(next).not.toHaveBeenCalled();
            expect(project.name).toBe("Updated Soybean Farm");
            expect(project.save).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(200);
            expect(res.body.data.financials.profit).toBe(600);
            expect(res.body.data.progress).toBe(50);
        });

        it("returns 404 when the project cannot be found", async () => {
            FarmProject.findOne.mockResolvedValue(null);

            const { res } = await invoke(
                controller.updateFarmProject
            );

            expect(res.statusCode).toBe(404);
        });

        it("forwards save errors", async () => {
            const error = new Error("Save failed");
            const project = makeProject();
            project.save.mockRejectedValue(error);
            mockOwnedProject(project);

            const { next } = await invoke(
                controller.updateFarmProject
            );

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("deleteFarmProject", () => {
        it("deletes the owned project", async () => {
            const project = makeProject();
            mockOwnedProject(project);

            const { res, next } = await invoke(
                controller.deleteFarmProject
            );

            expect(next).not.toHaveBeenCalled();
            expect(project.deleteOne).toHaveBeenCalledTimes(1);
            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe(
                "Farm project deleted successfully."
            );
        });

        it("returns 404 for a missing project", async () => {
            FarmProject.findOne.mockResolvedValue(null);

            const { res } = await invoke(
                controller.deleteFarmProject
            );

            expect(res.statusCode).toBe(404);
        });

        it("forwards deletion errors", async () => {
            const error = new Error("Delete failed");
            const project = makeProject();
            project.deleteOne.mockRejectedValue(error);
            mockOwnedProject(project);

            const { next } = await invoke(
                controller.deleteFarmProject
            );

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("getFarmDashboardSummary", () => {
        it("aggregates project finances, statuses, activities, tasks and progress", async () => {
            const projects = [
                makeProject({
                    status: "Planning",
                    harvests: [{ totalValue: 1000 }],
                    expenses: [{ amount: 200 }],
                    activities: [
                        {
                            status: "Pending",
                            dueDate: new Date(Date.now() - 86400000),
                        },
                        {
                            status: "In Progress",
                            dueDate: new Date(Date.now() + 86400000),
                        },
                        {
                            status: "Completed",
                            dueDate: new Date(Date.now() - 86400000),
                        },
                    ],
                    tasks: [
                        { status: "Pending" },
                        { status: "Completed" },
                    ],
                }),
                makeProject({
                    _id: "p2",
                    status: "Completed",
                    harvests: [{ totalValue: 500 }],
                    expenses: [{ amount: 100 }],
                    activities: [{ status: "Completed" }],
                    tasks: [],
                }),
            ];

            FarmProject.find.mockResolvedValue(projects);

            const { res, next } = await invoke(
                controller.getFarmDashboardSummary
            );

            expect(next).not.toHaveBeenCalled();
            expect(FarmProject.find).toHaveBeenCalledWith({
                user: USER_ID,
            });
            expect(res.statusCode).toBe(200);
            expect(res.body.data).toMatchObject({
                totalProjects: 2,
                planning: 1,
                active: 0,
                completed: 1,
                totalIncome: 1500,
                totalExpenses: 300,
                totalProfit: 1200,
                upcomingActivities: 1,
                overdueActivities: 1,
                pendingTasks: 1,
                completedTasks: 1,
                averageProgress: 70,
            });
        });

        it("returns zero totals for a user with no projects", async () => {
            FarmProject.find.mockResolvedValue([]);

            const { res } = await invoke(
                controller.getFarmDashboardSummary
            );

            expect(res.body.data).toEqual({
                totalProjects: 0,
                planning: 0,
                active: 0,
                completed: 0,
                totalIncome: 0,
                totalExpenses: 0,
                totalProfit: 0,
                upcomingActivities: 0,
                overdueActivities: 0,
                pendingTasks: 0,
                completedTasks: 0,
                averageProgress: 0,
            });
        });

        it("forwards errors while retrieving the dashboard summary", async () => {
            const error = new Error("Dashboard query failed");
            FarmProject.find.mockRejectedValue(error);

            const { next } = await invoke(
                controller.getFarmDashboardSummary
            );

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe("activities", () => {
        it("creates an activity with a default Pending status", async () => {
            const project = makeProject();
            mockOwnedProject(project);

            const { res, next } = await invoke(
                controller.createActivity,
                {
                    body: {
                        title: "Prepare land",
                        description: "Clear the field",
                        category: "Land Preparation",
                        priority: "High",
                    },
                }
            );

            expect(next).not.toHaveBeenCalled();
            expect(project.activities).toHaveLength(1);
            expect(project.activities[0]).toMatchObject({
                title: "Prepare land",
                status: "Pending",
            });
            expect(project.save).toHaveBeenCalled();
            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe(
                "Activity created successfully."
            );
            expect(res.body.data.progress).toBe(0);
        });

        it("returns 404 if the project does not exist", async () => {
            FarmProject.findOne.mockResolvedValue(null);

            const { res } = await invoke(
                controller.createActivity
            );

            expect(res.statusCode).toBe(404);
        });

        it("updates an activity and sets completion metadata", async () => {
            const project = makeProject({
                activities: [
                    {
                        _id: "activity-1",
                        title: "Plant seeds",
                        status: "Pending",
                        completed: false,
                        completedAt: null,
                    },
                ],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.updateActivity,
                {
                    params: {
                        id: PROJECT_ID,
                        activityId: "activity-1",
                    },
                    body: { status: "Completed" },
                }
            );

            expect(res.statusCode).toBe(200);
            expect(project.activities[0].completed).toBe(true);
            expect(project.activities[0].completedAt).toBeInstanceOf(Date);
            expect(res.body.data.progress).toBe(100);
        });

        it("clears completion metadata when an activity is not completed", async () => {
            const project = makeProject({
                activities: [
                    {
                        _id: "activity-1",
                        status: "Completed",
                        completed: true,
                        completedAt: new Date(),
                    },
                ],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.updateActivity,
                {
                    params: {
                        id: PROJECT_ID,
                        activityId: "activity-1",
                    },
                    body: { status: "Pending" },
                }
            );

            expect(res.statusCode).toBe(200);
            expect(project.activities[0].completed).toBe(false);
            expect(project.activities[0].completedAt).toBeNull();
            expect(res.body.data.progress).toBe(0);
        });

        it("returns 404 when the activity ID is missing", async () => {
            const project = makeProject();
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.updateActivity,
                {
                    params: {
                        id: PROJECT_ID,
                        activityId: "missing",
                    },
                }
            );

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("Activity not found.");
        });

        it("updates activity status and completion fields", async () => {
            const project = makeProject({
                activities: [
                    {
                        _id: "activity-1",
                        status: "Pending",
                        completed: false,
                        completedAt: null,
                    },
                ],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.updateActivityStatus,
                {
                    params: {
                        id: PROJECT_ID,
                        activityId: "activity-1",
                    },
                    body: { status: "Completed" },
                }
            );

            expect(res.statusCode).toBe(200);
            expect(project.activities[0].completed).toBe(true);
            expect(project.activities[0].completedAt).toBeInstanceOf(Date);
        });

        it("deletes an activity and saves the project", async () => {
            const project = makeProject({
                activities: [{ _id: "activity-1", status: "Pending" }],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.deleteActivity,
                {
                    params: {
                        id: PROJECT_ID,
                        activityId: "activity-1",
                    },
                }
            );

            expect(res.statusCode).toBe(200);
            expect(project.activities).toHaveLength(0);
            expect(project.save).toHaveBeenCalled();
        });

        it("returns 404 when deleting an activity that does not exist", async () => {
            mockOwnedProject(makeProject());

            const { res } = await invoke(
                controller.deleteActivity,
                {
                    params: {
                        id: PROJECT_ID,
                        activityId: "missing",
                    },
                }
            );

            expect(res.statusCode).toBe(404);
        });
    });

    describe("tasks", () => {
        it("creates a task and recalculates progress", async () => {
            const project = makeProject({
                activities: [{ status: "Completed" }],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.createTask,
                {
                    body: {
                        title: "Buy fertilizer",
                        status: "Completed",
                    },
                }
            );

            expect(res.statusCode).toBe(201);
            expect(project.tasks).toHaveLength(1);
            expect(res.body.data.progress).toBe(100);
        });

        it("updates a task's fields", async () => {
            const project = makeProject({
                tasks: [
                    {
                        _id: "task-1",
                        title: "Buy seeds",
                        status: "Pending",
                    },
                ],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.updateTask,
                {
                    params: {
                        id: PROJECT_ID,
                        taskId: "task-1",
                    },
                    body: { title: "Buy improved seeds" },
                }
            );

            expect(res.statusCode).toBe(200);
            expect(project.tasks[0].title).toBe("Buy improved seeds");
        });

        it("returns 404 when updating a missing task", async () => {
            mockOwnedProject(makeProject());

            const { res } = await invoke(
                controller.updateTask,
                {
                    params: {
                        id: PROJECT_ID,
                        taskId: "missing",
                    },
                }
            );

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("Task not found.");
        });

        it("updates task status and completion metadata", async () => {
            const project = makeProject({
                tasks: [
                    {
                        _id: "task-1",
                        status: "Pending",
                        completed: false,
                        completedAt: null,
                    },
                ],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.updateTaskStatus,
                {
                    params: {
                        id: PROJECT_ID,
                        taskId: "task-1",
                    },
                    body: { status: "Completed" },
                }
            );

            expect(res.statusCode).toBe(200);
            expect(project.tasks[0].completed).toBe(true);
            expect(project.tasks[0].completedAt).toBeInstanceOf(Date);
            expect(res.body.data.progress).toBe(100);
        });

        it("deletes a task", async () => {
            const project = makeProject({
                tasks: [{ _id: "task-1", status: "Pending" }],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.deleteTask,
                {
                    params: {
                        id: PROJECT_ID,
                        taskId: "task-1",
                    },
                }
            );

            expect(res.statusCode).toBe(200);
            expect(project.tasks).toHaveLength(0);
            expect(project.save).toHaveBeenCalled();
        });

        it("returns 404 when deleting a missing task", async () => {
            mockOwnedProject(makeProject());

            const { res } = await invoke(
                controller.deleteTask,
                {
                    params: {
                        id: PROJECT_ID,
                        taskId: "missing",
                    },
                }
            );

            expect(res.statusCode).toBe(404);
        });
    });

    describe("expenses", () => {
        it("creates an expense and recalculates totals", async () => {
            const project = makeProject({
                expenses: [{ amount: 200 }],
                harvests: [{ totalValue: 800 }],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.createExpense,
                {
                    body: {
                        category: "Fertilizer",
                        description: "Organic fertilizer",
                        amount: "150",
                    },
                }
            );

            expect(res.statusCode).toBe(201);
            expect(project.expenses).toHaveLength(2);
            expect(project.expenses[1].amount).toBe(150);
            expect(res.body.data.financials).toEqual({
                income: 800,
                expenses: 350,
                profit: 450,
            });
        });

        it("converts an invalid expense amount to zero", async () => {
            const project = makeProject();
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.createExpense,
                {
                    body: { category: "Other", amount: "invalid" },
                }
            );

            expect(res.statusCode).toBe(201);
            expect(project.expenses[0].amount).toBe(0);
        });

        it("updates an expense and recalculates financials", async () => {
            const project = makeProject({
                expenses: [
                    { _id: "expense-1", amount: 100 },
                ],
                harvests: [{ totalValue: 500 }],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.updateExpense,
                {
                    params: {
                        id: PROJECT_ID,
                        expenseId: "expense-1",
                    },
                    body: { amount: "250" },
                }
            );

            expect(res.statusCode).toBe(200);
            expect(project.expenses[0].amount).toBe(250);
            expect(res.body.data.financials.profit).toBe(250);
        });

        it("returns 404 when an expense is not found", async () => {
            mockOwnedProject(makeProject());

            const { res } = await invoke(
                controller.updateExpense,
                {
                    params: {
                        id: PROJECT_ID,
                        expenseId: "missing",
                    },
                }
            );

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("Expense not found.");
        });

        it("deletes an expense and updates financial totals", async () => {
            const project = makeProject({
                expenses: [{ _id: "expense-1", amount: 100 }],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.deleteExpense,
                {
                    params: {
                        id: PROJECT_ID,
                        expenseId: "expense-1",
                    },
                }
            );

            expect(res.statusCode).toBe(200);
            expect(project.expenses).toHaveLength(0);
            expect(res.body.data.financials.expenses).toBe(0);
        });

        it("returns 404 when deleting a missing expense", async () => {
            mockOwnedProject(makeProject());

            const { res } = await invoke(
                controller.deleteExpense,
                {
                    params: {
                        id: PROJECT_ID,
                        expenseId: "missing",
                    },
                }
            );

            expect(res.statusCode).toBe(404);
        });
    });

    describe("harvests", () => {
        it("creates a harvest and calculates total value", async () => {
            const project = makeProject({
                expenses: [{ amount: 100 }],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.createHarvest,
                {
                    body: {
                        crop: "Soybean",
                        quantity: "50",
                        pricePerUnit: "20",
                    },
                }
            );

            expect(res.statusCode).toBe(201);
            expect(project.harvests[0]).toMatchObject({
                crop: "Soybean",
                quantity: 50,
                unit: "kg",
                pricePerUnit: 20,
                totalValue: 1000,
            });
            expect(res.body.data.financials).toEqual({
                income: 1000,
                expenses: 100,
                profit: 900,
            });
        });

        it("uses zero for invalid quantity and price values", async () => {
            const project = makeProject();
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.createHarvest,
                {
                    body: {
                        crop: "Maize",
                        quantity: "bad",
                        pricePerUnit: "bad",
                    },
                }
            );

            expect(res.statusCode).toBe(201);
            expect(project.harvests[0].quantity).toBe(0);
            expect(project.harvests[0].pricePerUnit).toBe(0);
            expect(project.harvests[0].totalValue).toBe(0);
        });

        it("updates harvest quantity and price and recalculates total value", async () => {
            const project = makeProject({
                harvests: [
                    {
                        _id: "harvest-1",
                        crop: "Soybean",
                        quantity: 10,
                        pricePerUnit: 15,
                        totalValue: 150,
                    },
                ],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.updateHarvest,
                {
                    params: {
                        id: PROJECT_ID,
                        harvestId: "harvest-1",
                    },
                    body: {
                        quantity: "20",
                        pricePerUnit: "25",
                    },
                }
            );

            expect(res.statusCode).toBe(200);
            expect(project.harvests[0].quantity).toBe(20);
            expect(project.harvests[0].pricePerUnit).toBe(25);
            expect(project.harvests[0].totalValue).toBe(500);
            expect(res.body.data.financials.income).toBe(500);
        });

        it("returns 404 when a harvest is not found", async () => {
            mockOwnedProject(makeProject());

            const { res } = await invoke(
                controller.updateHarvest,
                {
                    params: {
                        id: PROJECT_ID,
                        harvestId: "missing",
                    },
                }
            );

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("Harvest not found.");
        });

        it("deletes a harvest and recalculates income", async () => {
            const project = makeProject({
                harvests: [
                    { _id: "harvest-1", totalValue: 400 },
                ],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.deleteHarvest,
                {
                    params: {
                        id: PROJECT_ID,
                        harvestId: "harvest-1",
                    },
                }
            );

            expect(res.statusCode).toBe(200);
            expect(project.harvests).toHaveLength(0);
            expect(res.body.data.financials.income).toBe(0);
        });

        it("returns 404 when deleting a missing harvest", async () => {
            mockOwnedProject(makeProject());

            const { res } = await invoke(
                controller.deleteHarvest,
                {
                    params: {
                        id: PROJECT_ID,
                        harvestId: "missing",
                    },
                }
            );

            expect(res.statusCode).toBe(404);
        });
    });

    describe("reminders", () => {
        it("creates a reminder as incomplete", async () => {
            const project = makeProject();
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.createReminder,
                {
                    body: {
                        title: "Water crops",
                        reminderDate: "2026-12-01",
                    },
                }
            );

            expect(res.statusCode).toBe(201);
            expect(project.reminders).toHaveLength(1);
            expect(project.reminders[0]).toMatchObject({
                title: "Water crops",
                completed: false,
            });
        });

        it("updates a reminder", async () => {
            const project = makeProject({
                reminders: [
                    {
                        _id: "reminder-1",
                        title: "Water crops",
                        completed: false,
                    },
                ],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.updateReminder,
                {
                    params: {
                        id: PROJECT_ID,
                        reminderId: "reminder-1",
                    },
                    body: { title: "Water crops today" },
                }
            );

            expect(res.statusCode).toBe(200);
            expect(project.reminders[0].title).toBe(
                "Water crops today"
            );
        });

        it("returns 404 when updating a missing reminder", async () => {
            mockOwnedProject(makeProject());

            const { res } = await invoke(
                controller.updateReminder,
                {
                    params: {
                        id: PROJECT_ID,
                        reminderId: "missing",
                    },
                }
            );

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe("Reminder not found.");
        });

        it("deletes a reminder", async () => {
            const project = makeProject({
                reminders: [
                    { _id: "reminder-1", title: "Water crops" },
                ],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.deleteReminder,
                {
                    params: {
                        id: PROJECT_ID,
                        reminderId: "reminder-1",
                    },
                }
            );

            expect(res.statusCode).toBe(200);
            expect(project.reminders).toHaveLength(0);
            expect(project.save).toHaveBeenCalled();
        });

        it("returns 404 when deleting a missing reminder", async () => {
            mockOwnedProject(makeProject());

            const { res } = await invoke(
                controller.deleteReminder,
                {
                    params: {
                        id: PROJECT_ID,
                        reminderId: "missing",
                    },
                }
            );

            expect(res.statusCode).toBe(404);
        });

        it("toggles a reminder from incomplete to complete", async () => {
            const project = makeProject({
                reminders: [
                    { _id: "reminder-1", completed: false },
                ],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.toggleReminderCompletion,
                {
                    params: {
                        id: PROJECT_ID,
                        reminderId: "reminder-1",
                    },
                }
            );

            expect(res.statusCode).toBe(200);
            expect(project.reminders[0].completed).toBe(true);
        });

        it("toggles a completed reminder back to incomplete", async () => {
            const project = makeProject({
                reminders: [
                    { _id: "reminder-1", completed: true },
                ],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.toggleReminderCompletion,
                {
                    params: {
                        id: PROJECT_ID,
                        reminderId: "reminder-1",
                    },
                }
            );

            expect(res.statusCode).toBe(200);
            expect(project.reminders[0].completed).toBe(false);
        });

        it("returns 404 when toggling a missing reminder", async () => {
            mockOwnedProject(makeProject());

            const { res } = await invoke(
                controller.toggleReminderCompletion,
                {
                    params: {
                        id: PROJECT_ID,
                        reminderId: "missing",
                    },
                }
            );

            expect(res.statusCode).toBe(404);
        });
    });

    describe("error handling and calculated values", () => {
        it("treats invalid or missing financial values as zero", async () => {
            const project = makeProject({
                harvests: [
                    { totalValue: "100" },
                    { totalValue: "invalid" },
                    {},
                ],
                expenses: [
                    { amount: "30" },
                    { amount: "invalid" },
                    {},
                ],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.getFarmProject
            );

            expect(res.body.data.financials).toEqual({
                income: 100,
                expenses: 30,
                profit: 70,
            });
        });

        it("rounds progress to the nearest whole percentage", async () => {
            const project = makeProject({
                activities: [
                    { status: "Completed" },
                    { status: "Pending" },
                ],
                tasks: [{ status: "Completed" }],
            });
            mockOwnedProject(project);

            const { res } = await invoke(
                controller.getFarmProject
            );

            expect(res.body.data.progress).toBe(67);
        });

        it("forwards errors from nested document saves", async () => {
            const error = new Error("Nested save failed");
            const project = makeProject();
            project.save.mockRejectedValue(error);
            mockOwnedProject(project);

            const { next } = await invoke(
                controller.createTask,
                { body: { title: "Check irrigation" } }
            );

            expect(next).toHaveBeenCalledWith(error);
        });

        it("returns 404 for nested operations on a missing project", async () => {
            FarmProject.findOne.mockResolvedValue(null);

            const handlers = [
                controller.createTask,
                controller.createExpense,
                controller.createHarvest,
                controller.createReminder,
                controller.createActivity,
            ];

            for (const handler of handlers) {
                const { res, next } = await invoke(handler);
                expect(next).not.toHaveBeenCalled();
                expect(res.statusCode).toBe(404);
            }
        });
    });
});