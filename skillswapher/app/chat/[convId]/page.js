import ChatClient from "./ChatClient";

export default function Page({ params }) {
  return <ChatClient convId={params.convId} />;
}
