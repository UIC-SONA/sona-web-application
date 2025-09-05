"use client"

import {authenticatedClient} from "@/lib/http/axios";
import {getCachedSession} from "@/lib/session-client";


const createClient = () => authenticatedClient(getCachedSession);
const client = createClient();

export {
  createClient,
  client
}