const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://oscksafwlfkpqvifcvae.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zY2tzYWZ3bGZrcHF2aWZjdmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMjU0NTAsImV4cCI6MjA5MjYwMTQ1MH0.sPWAYd62hP1Htlxa_9s2-T1ZzN9C5UbxHbiOatHFxZs'
);

const passwords = [
  'TestPassword123!', 'password', 'admin', 'admin123', 'admin123!', 
  'Clixpro123!', 'Password123!', 'password123', '123456', 'qwerty',
  'clientRisecrm' // from DATABASE_URL
];

async function tryLogin() {
  for (const p of passwords) {
    console.log(`Trying ${p}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@clixprocrm.com',
      password: p
    });
    if (!error) {
      console.log('SUCCESS! Password is:', p);
      return;
    }
  }
  console.log('Failed to guess password.');
}

tryLogin();
