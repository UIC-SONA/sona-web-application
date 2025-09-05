import {getServerSession} from "@/lib/session-server";
import {authenticatedClient} from "@/lib/http/axios";

function getSession() {
  return getServerSession({update: true});
}

const createClient = () => authenticatedClient(getSession);
const client = createClient();

export {
  createClient,
  client
}