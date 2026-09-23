import { redirect } from 'next/navigation'
import { OrgForm } from './org-form'
import { SignupSteps } from '../../../components/signup-steps'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { activeOrg } from '../../../lib/org'
import { currentUser } from '../../../lib/auth'

export default async function SignupOrgPage() {
  const user = await currentUser()
  if (!user) redirect('/signup')
  if (await activeOrg()) redirect('/signup/plan') // workspace exists — continue

  return (
    <div className="mx-auto mt-10 max-w-xl space-y-6">
      <SignupSteps current={1} />
      <Card>
        <CardHeader>
          <CardTitle>Name your workspace</CardTitle>
          <CardDescription>Usually your business name — it appears in emails and the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrgForm />
        </CardContent>
      </Card>
    </div>
  )
}
