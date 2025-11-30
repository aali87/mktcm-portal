import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Calendar, ShoppingBag } from "lucide-react";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Fetch user details with purchases
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      purchases: {
        where: { status: "COMPLETED" },
        include: {
          product: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
      <Header user={session.user} />

      <main className="max-w-container mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl text-neutral-800 mb-3">
            My Profile
          </h1>
          <p className="text-body-lg text-neutral-600">
            Manage your account information
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Information */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your personal details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-neutral-500">Name</label>
                  <p className="text-neutral-800 mt-1">{user.name || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-500">Email</label>
                  <p className="text-neutral-800 mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-neutral-400" />
                    {user.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-500">Member Since</label>
                  <p className="text-neutral-800 mt-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-neutral-400" />
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <p className="text-3xl font-serif text-primary">{user.purchases.length}</p>
                <p className="text-sm text-neutral-600">Programs Owned</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Purchased Programs */}
        {user.purchases.length > 0 && (
          <div className="mt-12">
            <h2 className="font-serif text-2xl text-neutral-800 mb-6">
              Purchased Programs
            </h2>
            <div className="space-y-4">
              {user.purchases.map((purchase) => (
                <Card key={purchase.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-lg text-neutral-800">
                          {purchase.product.name}
                        </h3>
                        <p className="text-sm text-neutral-500">
                          Purchased on{" "}
                          {new Date(purchase.createdAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-neutral-800">
                          ${(purchase.amount / 100).toFixed(2)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          purchase.paymentType === "FULL"
                            ? "bg-green-100 text-green-700"
                            : purchase.planComplete
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {purchase.paymentType === "FULL"
                            ? "Paid in Full"
                            : purchase.planComplete
                              ? "Payment Plan Complete"
                              : "Payment Plan Active"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
