import type { APIRoute } from "astro";
import { site } from "../data/site";

export const prerender = true;

export const GET: APIRoute = () => {
  const body = JSON.stringify({
    status: "ok",
    service: "static",
    version: site.version,
  });
  return new Response(body, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
