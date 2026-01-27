import { withAuth } from "next-auth/middleware"

export default withAuth({
    callbacks: {
        authorized: ({ req, token }) => {
            // Allow access to login page without token prevents infinite loop
            if (req.nextUrl.pathname.startsWith("/admin/login")) {
                return true
            }
            return !!token
        },
    },
})

export const config = { matcher: ["/admin/:path*"] }
