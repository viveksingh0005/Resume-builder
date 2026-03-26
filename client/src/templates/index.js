import { classic }    from "./classic";
import techTwoCol from "./tech-two-col";
// import { modern }     from "./modern";
// import { executive }  from "./executive";
// ... import all 20

export const TEMPLATES = [
  classic,
  techTwoCol
//   executive,
  // ...
];

export const getTemplateById = (id) =>
  TEMPLATES.find(t => t.id === id) ?? TEMPLATES[0];