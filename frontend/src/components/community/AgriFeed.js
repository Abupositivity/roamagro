import React from 'react';
import { List, ListItem, ListItemText, Divider } from '@mui/material';

const AgriFeed = () => {
  const tips = [
    "Tip #1: Diversify your crops to reduce risks.",
    "Tip #2: Invest in modern irrigation to improve productivity.",
    "Tip #3: Utilize organic farming techniques to reduce costs."
  ];

  return (
    <List>
      {tips.map((tip, index) => (
        <React.Fragment key={index}>
          <ListItem>
            <ListItemText primary={tip} />
          </ListItem>
          {index < tips.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default AgriFeed;