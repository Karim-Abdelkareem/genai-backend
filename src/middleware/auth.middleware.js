import jwt from "jsonwebtoken";

export function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;
  const cookieToken = req.cookies?.accessToken;
  const jwtToken = token || cookieToken;

  if (!jwtToken) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required", data: null });
  }
  try {
    const decoded = jwt.verify(
      jwtToken,
      process.env.JWT_ACCESS_SECRET || "access_secret_dev"
    );
    req.user = decoded;
    return next();
  } catch (err) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Invalid or expired token",
        data: null,
      });
  }
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden", data: null });
    }
    next();
  };
}

export function authorizeSelfOrRoles(paramKey = "id", ...roles) {
  return (req, res, next) => {
    const userId = req.user?.sub;
    const targetId = req.params?.[paramKey];
    const userRole = req.user?.role;
    if (userId && targetId && userId === targetId) return next();
    if (userRole && roles.includes(userRole)) return next();
    return res
      .status(403)
      .json({ success: false, message: "Forbidden", data: null });
  };
}
