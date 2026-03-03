import JoinFamilyClient from '@/components/JoinFamilyClient'

export default async function JoinFamilyPage({
  params,
}: {
  params: Promise<{ inviteCode: string }>
}) {
  const { inviteCode } = await params
  return <JoinFamilyClient inviteCode={inviteCode} />
}
