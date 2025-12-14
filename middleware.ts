import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    let res = NextResponse.next({
        request: {
            headers: req.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
        {
            cookies: {
                get(name: string) {
                    return req.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: any) {
                    req.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    res.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: any) {
                    req.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    res = NextResponse.next({
                        request: {
                            headers: req.headers,
                        },
                    });
                    res.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Protect dashboard routes
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
        if (!session) {
            const redirectUrl = req.nextUrl.clone();
            redirectUrl.pathname = '/login';
            redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
            return NextResponse.redirect(redirectUrl);
        }
    }

    // Redirect to dashboard if already logged in and trying to access login/signup
    if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/dashboard';
        return NextResponse.redirect(redirectUrl);
    }

    return res;
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/signup'],
};
