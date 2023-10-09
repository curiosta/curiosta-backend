import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authenticate, authenticateCustomer } from "@medusajs/medusa";
import express, { Router } from "express";
import { ulid } from "ulid";

export const uploadFile = (router: Router, { s3Client }: { s3Client: S3Client }) => {
  router.use('/uploads/getPreSignedUrl', express.json())

  router.get('/uploads/getPreSignedUrl', authenticateCustomer(), async (req, res) => {
    if (!req.user) {
      // checks if user is admin if user is not a customer
      authenticate()(req, res, () => { })
      if (!req.user) {
        return res.status(403).send()
      }
    }
    const ext = req.query.ext as string
    if (!ext) return res.status(422).send('Missing file extension!');


    const id = req.user.customer_id || req.user.userId;

    const key = `${id}/${ulid()}.${ext}`
    const command = new PutObjectCommand({ Bucket: process.env.AWS_BUCKET, Key: key });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes

    return res.json({
      url,
      key
    })
  })
}