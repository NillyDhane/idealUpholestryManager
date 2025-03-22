# Ideal Caravans Upholstery Manager

A web application for managing upholstery orders for caravans.

## Features

- Create upholstery orders with detailed specifications
- Save and load preset orders
- Download orders as PDF documents
- Responsive design (mobile-friendly)

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **PDF Generation**: @react-pdf/renderer

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (free tier works fine)

### Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local`
3. Fill in your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL schema file located in `supabase/schema.sql` in the Supabase SQL editor to create the necessary tables and policies

### Installation

```bash
# Install dependencies
npm install
# or
yarn

# Run development server
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000

## Usage

1. Fill out the upholstery order form with all the details
2. Submit the form to save it to the database
3. Save as a preset if you want to reuse this configuration
4. Download the order as a PDF

## Mobile Responsive Design

The application is designed to work well on mobile devices, making it easy to use on tablets or phones in a workshop environment.

## License

MIT
