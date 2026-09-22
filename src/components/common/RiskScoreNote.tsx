import { MethodologyNote } from "../ui";

/** How the country risk score is produced. Shared wherever the score appears. */
export default function RiskScoreNote({ className = "" }: { className?: string }) {
  return (
    <MethodologyNote title="How the country risk score is computed" className={className}>
      <p>
        Each country's score (0–100) is a weighted blend of five signals from its threat indicators: volume relative
        to the highest-volume country, a volume-severity band, cross-source corroboration (how many independent feeds
        flag it), the average VirusTotal malicious-engine count, and the number of contributing sources.
      </p>
      <p>
        Bands: Low 0–29, Medium 30–44, High 45–64, Critical 65+. The global risk index is the average country score
        weighted by indicator volume.
      </p>
      <p>
        The formula is in <span className="code text-xs">collectors/final_merge.py</span>. The dataset in use
        (<span className="code text-xs">final_country_risks_v9.csv</span>) was produced by a later revision that also
        counts PhishTank, GreyNoise and Shodan, so individual scores can differ from that script by a few points.
      </p>
    </MethodologyNote>
  );
}
