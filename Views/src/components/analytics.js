import ReactGA from "react-ga4";

export const initGA = () => {
  ReactGA.initialize("G-NHN5G8KRGY"); // Replace with your Measurement ID
};

export const trackPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};
