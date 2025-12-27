import { getRequests } from "@/app/actions/request";
import { RequestsView } from "@/components/RequestsView";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

// Server Component
export default async function Page() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) return <div>Not authenticated</div>;

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    const requests = await getRequests();

    return <RequestsView requests={requests as any} currentUser={currentUser as any} />;
}
