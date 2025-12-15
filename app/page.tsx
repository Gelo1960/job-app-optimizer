import { redirect } from 'next/navigation';
import { createClient } from '@/lib/db/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }

  // Ce code ne sera jamais exécuté car redirect lance une exception
  return null;
}
