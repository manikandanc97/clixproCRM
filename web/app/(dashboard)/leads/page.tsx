import { redirect } from 'next/navigation';

export default function LeadsRedirect() {
  redirect('/contacts?status=lead');
}
