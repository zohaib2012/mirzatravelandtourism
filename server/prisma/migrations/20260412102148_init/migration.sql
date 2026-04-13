-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AGENT');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "GroupCategory" AS ENUM ('UMRAH', 'UAE_ONE_WAY', 'KSA_ONE_WAY', 'OMAN_ONE_WAY', 'UK_ONE_WAY');

-- CreateEnum
CREATE TYPE "GroupStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SOLD_OUT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('ON_REQUEST', 'PARTIAL', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('AIRLINE', 'PACKAGE', 'UMRAH_CALCULATOR');

-- CreateEnum
CREATE TYPE "PassengerType" AS ENUM ('ADULT', 'CHILD', 'INFANT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('POSTED', 'UNPOSTED');

-- CreateEnum
CREATE TYPE "HotelCity" AS ENUM ('MAKKAH', 'MADINA');

-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('PRIVATE', 'SHARING');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "agent_code" TEXT,
    "agency_name" TEXT NOT NULL,
    "contact_person" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "city" TEXT,
    "country" TEXT DEFAULT 'Pakistan',
    "logo_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'AGENT',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airlines" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "airlines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectors" (
    "id" SERIAL NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "route_display" TEXT NOT NULL,
    "is_round_trip" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight_groups" (
    "id" SERIAL NOT NULL,
    "group_name" TEXT NOT NULL,
    "category" "GroupCategory" NOT NULL,
    "airline_id" INTEGER NOT NULL,
    "sector_id" INTEGER NOT NULL,
    "total_seats" INTEGER NOT NULL,
    "available_seats" INTEGER NOT NULL,
    "departure_date" DATE NOT NULL,
    "return_date" DATE,
    "num_days" INTEGER,
    "adult_price" DECIMAL(12,2) NOT NULL,
    "child_price" DECIMAL(12,2),
    "infant_price" DECIMAL(12,2),
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "pnr_1" TEXT,
    "pnr_2" TEXT,
    "status" "GroupStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flight_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flight_legs" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "leg_number" INTEGER NOT NULL,
    "flight_number" TEXT NOT NULL,
    "departure_date" DATE NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "departure_time" TEXT,
    "arrival_time" TEXT,
    "baggage" TEXT,

    CONSTRAINT "flight_legs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "booking_no" TEXT NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "group_id" INTEGER,
    "package_id" INTEGER,
    "booking_type" "BookingType" NOT NULL DEFAULT 'AIRLINE',
    "room_type" TEXT,
    "adults_count" INTEGER NOT NULL,
    "children_count" INTEGER NOT NULL DEFAULT 0,
    "infants_count" INTEGER NOT NULL DEFAULT 0,
    "total_seats" INTEGER NOT NULL,
    "total_price" DECIMAL(12,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'ON_REQUEST',
    "expiry_time" TIMESTAMP(3),
    "auto_cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passengers" (
    "id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PassengerType" NOT NULL,
    "dob" DATE,
    "passport_no" TEXT,

    CONSTRAINT "passengers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotels" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city" "HotelCity" NOT NULL,
    "distance" DECIMAL(8,2),
    "star_rating" INTEGER,
    "sharing_rate" DECIMAL(10,2),
    "double_rate" DECIMAL(10,2),
    "triple_rate" DECIMAL(10,2),
    "quad_rate" DECIMAL(10,2),
    "quint_rate" DECIMAL(10,2),
    "valid_from" DATE,
    "valid_to" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "umrah_packages" (
    "id" SERIAL NOT NULL,
    "package_name" TEXT NOT NULL,
    "group_id" INTEGER,
    "num_days" INTEGER,
    "available_seats" INTEGER,
    "shared_price" DECIMAL(12,2),
    "double_price" DECIMAL(12,2),
    "triple_price" DECIMAL(12,2),
    "quad_price" DECIMAL(12,2),
    "departure_date" DATE,
    "return_date" DATE,
    "status" "GroupStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "umrah_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_hotels" (
    "id" SERIAL NOT NULL,
    "package_id" INTEGER NOT NULL,
    "hotel_id" INTEGER NOT NULL,
    "city" "HotelCity" NOT NULL,
    "nights" INTEGER NOT NULL,
    "checkin_date" DATE,
    "checkout_date" DATE,
    "sequence" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "package_hotels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package_transports" (
    "id" SERIAL NOT NULL,
    "package_id" INTEGER NOT NULL,
    "transport_id" INTEGER NOT NULL,
    "cost" DECIMAL(10,2),

    CONSTRAINT "package_transports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visa_types" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "adult_buy_rate" DECIMAL(10,2),
    "adult_sell_rate" DECIMAL(10,2),
    "child_buy_rate" DECIMAL(10,2),
    "child_sell_rate" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "visa_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transports" (
    "id" SERIAL NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "route" TEXT,
    "buy_rate" DECIMAL(10,2),
    "sell_rate" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "transports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" SERIAL NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_title" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "iban" TEXT,
    "branch_address" TEXT,
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "voucher_id" TEXT NOT NULL,
    "agent_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT,
    "bank_account_id" INTEGER,
    "amount" DECIMAL(12,2) NOT NULL,
    "receipt_url" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'UNPOSTED',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" SERIAL NOT NULL,
    "voucher_no" TEXT,
    "agent_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "description" TEXT,
    "debit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "credit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "booking_id" INTEGER,
    "payment_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_branches" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "image_url" TEXT,
    "is_head" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "office_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "authorizations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "authorizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_settings" (
    "id" SERIAL NOT NULL,
    "company_name" TEXT NOT NULL,
    "tagline" TEXT,
    "logo_url" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "whatsapp" TEXT,
    "address" TEXT,
    "facebook_url" TEXT,
    "instagram_url" TEXT,
    "twitter_url" TEXT,
    "youtube_url" TEXT,
    "linkedin_url" TEXT,
    "hero_video_url" TEXT,
    "hero_image_url" TEXT,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_agent_code_key" ON "users"("agent_code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_no_key" ON "bookings"("booking_no");

-- CreateIndex
CREATE UNIQUE INDEX "package_transports_package_id_key" ON "package_transports"("package_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_voucher_id_key" ON "payments"("voucher_id");

-- AddForeignKey
ALTER TABLE "flight_groups" ADD CONSTRAINT "flight_groups_airline_id_fkey" FOREIGN KEY ("airline_id") REFERENCES "airlines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_groups" ADD CONSTRAINT "flight_groups_sector_id_fkey" FOREIGN KEY ("sector_id") REFERENCES "sectors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flight_legs" ADD CONSTRAINT "flight_legs_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "flight_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "flight_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "umrah_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passengers" ADD CONSTRAINT "passengers_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "umrah_packages" ADD CONSTRAINT "umrah_packages_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "flight_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_hotels" ADD CONSTRAINT "package_hotels_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "umrah_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_hotels" ADD CONSTRAINT "package_hotels_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_transports" ADD CONSTRAINT "package_transports_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "umrah_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package_transports" ADD CONSTRAINT "package_transports_transport_id_fkey" FOREIGN KEY ("transport_id") REFERENCES "transports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
