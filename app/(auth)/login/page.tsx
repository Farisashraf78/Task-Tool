import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import Input usually, but will use native input with styling for speed or create generic Input later
// I'll create generic Input component first or inline styling. inline for now.

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-talabat-offwhite px-4">
            <Card className="w-full max-w-md border-talabat-orange/20 shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-talabat-orange w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <CardTitle className="text-talabat-orange text-3xl font-bold">Talabat Team</CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Enter your email to access the Task Manager
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={async (formData) => {
                        "use server";
                        await login(formData);
                    }} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-talabat-brown">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                placeholder="name@talabat.com"
                                className="flex h-12 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-talabat-orange focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-talabat-orange hover:bg-orange-600 h-12 text-lg">
                            Sign In
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
