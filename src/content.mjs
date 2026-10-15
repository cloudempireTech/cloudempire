import content from './content.json' with { type: 'json' };
import prioritySeo from './priority-seo.json' with { type: 'json' };

const allServices = [
  ...content.services.map(service => ({...service, ...(prioritySeo[service.slug] || {})})),
  ...Object.entries(prioritySeo).filter(([slug]) => !content.services.some(existing => existing.slug === slug)).map(([,service]) => service),
];
const priority = ['ai-analytics','web-development','android-app-development','ios-app-development','custom-software-development'];
export const services = [...priority.map(slug => allServices.find(service => service.slug === slug)).filter(Boolean), ...allServices.filter(service => !priority.includes(service.slug))];
export const projects = content.projects;
export const processSteps = content.processSteps;
export const articles = content.articles;
