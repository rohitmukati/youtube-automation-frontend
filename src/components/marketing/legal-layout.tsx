import { siteConfig } from "@/config/site";
import { formatDate } from "@/lib/format";
import type { LegalSection } from "@/features/legal/types";

interface LegalLayoutProps {
  title: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalLayout({ title, intro, sections }: LegalLayoutProps) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
      <header className="max-w-3xl">
        <h1 className="text-foreground text-[40px] leading-tight font-medium tracking-tight sm:text-[52px]">
          {title}
        </h1>
        <p className="text-muted-foreground mt-3 text-sm">
          Last updated {formatDate(siteConfig.legalUpdatedAt)}
        </p>
        <p className="text-body mt-6 text-lg">{intro}</p>
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="border-border sticky top-24 flex flex-col gap-1 border-l">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-muted-foreground hover:border-foreground hover:text-foreground -ml-px block border-l border-transparent py-1.5 pl-4 text-sm transition-colors"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex max-w-3xl flex-col gap-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-foreground text-2xl font-medium tracking-tight">
                {section.title}
              </h2>
              <div className="mt-4 flex flex-col gap-4">
                {section.blocks.map((block, index) =>
                  block.type === "p" ? (
                    <p key={index} className="text-body text-[16px] leading-[1.7]">
                      {block.text}
                    </p>
                  ) : (
                    <ul
                      key={index}
                      className="text-body marker:text-muted-foreground flex list-disc flex-col gap-2.5 pl-5 text-[16px] leading-[1.7]"
                    >
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
