import Login from "../shared/Login";

export default async function LoginPage() {
  async function tryLogin(adminPassword: string) {
    "use server";
    if (adminPassword === process.env.ADMIN_PASSWORD) {
      return true;
    } else {
      return false;
    }
  }

  return <Login tryLogin={tryLogin} />;
}
export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
