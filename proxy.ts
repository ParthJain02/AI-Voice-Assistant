import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/tasks/:path*", "/api/reminders/:path*", "/api/settings/:path*"],
};
