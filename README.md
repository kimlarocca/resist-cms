# Resist CMS

NODE VERSION: 22.14.0

## Setup

Make sure to install dependencies:

```bash
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

View the styleguide on `http://localhost:3000/styleguide`

## Testing Notes

If you update your user's role (or anything in your profiles table row) in Supabase, you will have to log out and log back in for that to go into effect.

The websites_users table controls which users have access to manage which groups/websites.

On survey completion rates: if you have test candidates in multiple races/surveys, it will take that into account. For example, with my test candidate Kim-Larocca, I'm in 4 surveys with 400+ questions total and 75% answered. So my completion rate is 75% across all surveys, not 100% for one survey and 0% for the others.
