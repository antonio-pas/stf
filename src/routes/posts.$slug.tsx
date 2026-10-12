import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import posts from '../posts.json'
import Markdown from 'react-markdown'

export const Route = createFileRoute('/posts/$slug')({
  component: RouteComponent,
  loader: ({ params }) => {
    return {author:"Antonio Passos", description:"You hear about them all the time. But what even are human rights? And why should we care as students?", title:"What are human rights?",content:`
Lorem markdownum iamque iactas patrumque, *pronos haec* cum vix tectus Peleus;
in iuxta similis iugeribus actis et visus. Et foedus murmure qui gaudere votique
corpora festaque Hippotades novas, per. Mortale accendit, erat busto violenta:
iam venit spinae, mansit deos, modo.

## Rogat adcommodat fuit

### Matris pectora saevo

Lorem markdownum iamque iactas patrumque, *pronos haec* cum vix tectus Peleus;
in iuxta similis iugeribus actis et visus. Et foedus murmure qui gaudere votique
corpora festaque Hippotades novas, per. Mortale accendit, erat busto violenta:
iam venit spinae, mansit deos, modo.

### Addidit reddite

Quartusque summae tota pro et nostra male easdem parte silvis, saeviat serpunt
[que](#quod-ratione-inmensa-sidereum). Sed sed temperat donec aliquisque luridus
et deus et \`cardChecksum\`: voluptas scelus Stygia et altum. Dextra grata
concorditer adhuc, absens regis requievit Anguemque bracchia Vestaque cacumen;
nisi moriens.

1. Bis ne solita aegide
2. Montibus inopino valet sed lignum
3. Illa infamia canescere sanguine

### Necem est sumptumque tamen

Mortale in furit carmine iterum! Haeserunt mihi plangor! Iaculo facit, dedi,
constabat turba, blanditias aliquis, in aer: a. Qui est cara est Macareida natus
pulsabant ubi posse, non figurae prohibente.

## Purpura eandem quod cura

### Insula ignis nymphas

Timorem et deosque nescisse propiore abit si quod canescere nuda. Hinc pianda
nec. Cur Danais greges. Confundere lacteus vela sidus alimentaque venerat axis
concepit faciat tua rerum concipit carinas, si. Deus in procul \`veronica\` habili
tota; quaque undis es saxa?

1. Fuit sed nec moderato Athenae nec rota
2. Superas laesae nunc nomenque
3. Haec bracchiaque querella
4. Ea ut me tangit ullas poterat centauri
5. Iussi dividite Phoebi
6. Natus sic horriferamque prodet signataque Crotonis sunt

### Quod ratione inmensa sidereum

Madescit indoluit miseram subiectis inpia: iubet adspergine haec. Lanient hic in
*pars* ratibusque et ferreus exhausta, non undas nox materna lucos \`icmp\`: qui,
suis reddat aures. Currus constituunt fecit ulvae bracchia *illa* nomen cretus
et sua avidosque lingua in quid. Decimum et nec talia dicturus, et constitit
robora moriens tractu fata finem color enim sic.

> Ibat cadendum, [ad obscura](#et-sortes-lingua) latus Vesta, orbem quas;
> foramine. Fera aut capulo? Suum traxit territa cervae!

`}
    if (posts[params.slug]) {
      return posts[params.slug]
    } else {
      throw new Error('No such post')
    }
  }
})

function RouteComponent() {
  const post = Route.useLoaderData()
  return (
    <main className="max-w-prose w-full mx-auto">
      <Suspense fallback={<div>loading...</div>}>
        <header className="flex flex-col gap-4 mb-10">
          <h1 className="text-4xl font-heading lg:text-5xl font-semibold font-header">
            {post.title}
          </h1>
          <h2 className="font-heading text-2xl text-stone-600">
            {post.description}
          </h2>
          <div className="flex font-heading text-sm text-zinc-700 items-center">
          <div className="size-6 bg-stone-300 rounded-full aspect-square" />
            By{' '}<span className="font-semibold">{post.author}</span>
          </div>
        </header>
        <article className="prose prose-stone prose-headings:font-heading">
          <Markdown>{post.content}</Markdown>
        </article>
      </Suspense></main>
  )
}
