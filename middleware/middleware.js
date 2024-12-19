// Middleware that would take the jwt or other authentication and
// verify the authentication is valid, parse any data that is required
// (user, accessLevel, role etc) and put it into the request and then
// forward the request to the next level.
// Not Implemented
export const middleware = (req, res, next) => {
  return next();
};
