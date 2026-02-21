import ChatClient from "./ChatClient";

export default async function Page({ params }) {
  const { convId } = await params;
  return <ChatClient convId={convId} />;
}