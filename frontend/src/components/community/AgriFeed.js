import React from 'react';
import { List, ListItem, ListItemText, Divider } from '@mui/material';

const AgriFeed = () => {
  const tips = [
    "Diversify your crops to reduce risks.",
    "Invest in modern irrigation to improve productivity.",
    "Utilize appropriate amounts of fertilizer at optimal moments during a crop cycle.",
    "Plant cover crops on your farm to enrich your soil with nutrients.",
    "Keep Yourself Current and on top of Latest Farming Trends.",
    "Utilize organic farming techniques to reduce costs."
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