ALTER TABLE "PasswordReset"
ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "PasswordReset"
ADD COLUMN "deliveryPartnerId" TEXT;

CREATE UNIQUE INDEX "PasswordReset_deliveryPartnerId_key"
ON "PasswordReset"("deliveryPartnerId");

ALTER TABLE "PasswordReset"
ADD CONSTRAINT "PasswordReset_deliveryPartnerId_fkey"
FOREIGN KEY ("deliveryPartnerId") REFERENCES "DeliveryPartner"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PasswordReset"
ADD CONSTRAINT "PasswordReset_exactly_one_account_check"
CHECK (("userId" IS NOT NULL) <> ("deliveryPartnerId" IS NOT NULL));
