import { createUploadthing, type FileRouter } from "uploadthing/next";
import { adminAuth } from "@/lib/firebase/admin";

const f = createUploadthing();

async function verifyFirebaseToken(req: Request): Promise<string> {
  const token = req.headers.get("authorization")?.slice(7);
  if (!token) throw new Error("Unauthorized");
  const decoded = await adminAuth().verifyIdToken(token);
  return decoded.uid;
}

export const ourFileRouter = {
  resumePdf: f({ pdf: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const uid = await verifyFirebaseToken(req);
      return { uid };
    })
    .onUploadComplete(({ metadata, file }) => {
      return { url: file.ufsUrl, uid: metadata.uid };
    }),

  avatar: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const uid = await verifyFirebaseToken(req);
      return { uid };
    })
    .onUploadComplete(({ metadata, file }) => {
      return { url: file.ufsUrl, uid: metadata.uid };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
