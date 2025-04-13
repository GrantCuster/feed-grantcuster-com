import Logout from "../shared/Logout";

export default async function LogoutPage() {
  return <Logout />
}
export const getConfig = async () => {
  return {
    render: "dynamic",
  } as const;
};
