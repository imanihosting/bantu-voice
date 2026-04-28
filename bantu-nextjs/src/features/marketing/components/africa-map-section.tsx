import { AfricaMap } from "./africa-map";

export function AfricaMapSection() {
  return (
    <section id="languages" className="border-t border-white/10 bg-black py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Text content */}
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Powering Africa&apos;s Voice
            </h2>
            <p className="max-w-lg text-base text-white/60 sm:text-lg">
              Building the first voice AI engine for the African continent —
              starting with 14+ Southern African languages and expanding across
              every region.
            </p>

            {/* Stats */}
            <div className="flex items-center gap-8">
              <div>
                <p className="text-3xl font-bold text-amber-400">8</p>
                <p className="text-sm text-white/50">Countries Launching</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-amber-400">14+</p>
                <p className="text-sm text-white/50">Languages Supported</p>
              </div>
            </div>
          </div>

          {/* Interactive map */}
          <div className="relative">
            <AfricaMap />
          </div>
        </div>
      </div>
    </section>
  );
}
