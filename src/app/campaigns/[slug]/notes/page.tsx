import { createPlayerNoteAction, deletePlayerNoteAction } from "@/app/campaigns/[slug]/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireCampaignContext } from "@/lib/campaign";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

type NotesPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NotesPage({ params, searchParams }: NotesPageProps) {
  const { slug } = await params;
  const { access, sessionUser } = await requireCampaignContext(slug);
  const resolvedSearchParams = await searchParams;

  const [notes, myCharacters] = await Promise.all([
    prisma.playerNote.findMany({
      where: {
        campaignId: access.campaign.id,
        ...(access.isMaster ? {} : { ownerUserId: sessionUser.id }),
      },
      include: {
        ownerUser: { select: { displayName: true } },
        character: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.character.findMany({
      where: {
        campaignId: access.campaign.id,
        ownerUserId: sessionUser.id,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Player Notes & Diary</CardTitle>
          <CardDescription>Spazio personale per appunti privati, obiettivi e relazioni.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-sm text-neutral-400">No notes yet.</p>
          ) : (
            notes.map((note) => (
              <article key={note.id} className="rounded-md border border-neutral-800 bg-neutral-900/70 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-medium text-neutral-100">{note.title}</h3>
                    <p className="text-xs text-neutral-500">
                      {note.ownerUser.displayName}
                      {note.character ? ` · ${note.character.name}` : ""} · {formatDate(note.updatedAt)}
                    </p>
                  </div>
                  <form action={deletePlayerNoteAction.bind(null, slug, note.id)}>
                    <Button size="sm" variant="destructive" type="submit">
                      Delete
                    </Button>
                  </form>
                </div>
                <p className="whitespace-pre-wrap text-sm text-neutral-300">{note.content}</p>
              </article>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Note</CardTitle>
          <CardDescription>Visibilità `owned_private` per default.</CardDescription>
        </CardHeader>
        <CardContent>
          {resolvedSearchParams.error === "invalid_note" ? (
            <p className="mb-3 rounded-md border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">
              Note title/content invalid.
            </p>
          ) : null}
          <form action={createPlayerNoteAction.bind(null, slug)} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="characterId">Linked Character (optional)</Label>
              <select
                id="characterId"
                name="characterId"
                className="h-10 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100"
                defaultValue=""
              >
                <option value="">No linked character</option>
                {myCharacters.map((character) => (
                  <option key={character.id} value={character.id}>
                    {character.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" className="min-h-40" required />
            </div>
            <Button type="submit">Save Note</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
