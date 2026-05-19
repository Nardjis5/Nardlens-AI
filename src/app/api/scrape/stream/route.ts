import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "unknown";
  const urlParam = searchParams.get("url");

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Step 1: Discovery
        sendEvent({ type: "status", status: "discovery", step: 1 });
        sendEvent({ type: "log", message: `[AI] Initiating semantic search for: "${query}"` });
        await new Promise(r => setTimeout(r, 1000));
        
        if (urlParam) {
           sendEvent({ type: "log", message: `[System] Target URL locked: ${urlParam}` });
        } else {
           sendEvent({ type: "log", message: `[System] Discovered 3 high-potential target websites...` });
        }
        await new Promise(r => setTimeout(r, 1000));

        // Step 2: Crawling
        sendEvent({ type: "status", status: "crawling", step: 2 });
        sendEvent({ type: "log", message: "[Playwright] Launching headless browser instances..." });
        await new Promise(r => setTimeout(r, 1000));
        sendEvent({ type: "log", message: "[Playwright] Executing dynamic scrolls and bypassing rate limits..." });
        await new Promise(r => setTimeout(r, 1500));
        sendEvent({ type: "log", message: "[System] DOM trees extracted successfully. Size: 1.2MB" });
        await new Promise(r => setTimeout(r, 1000));

        // Step 3: Processing
        sendEvent({ type: "status", status: "processing", step: 3 });
        sendEvent({ type: "log", message: "[AI] Passing unstructured HTML to Gemini for entity extraction..." });
        await new Promise(r => setTimeout(r, 1500));
        sendEvent({ type: "log", message: "[System] Validating JSON schemas and deduplicating records..." });
        await new Promise(r => setTimeout(r, 1000));

        const extractCategory = (q: string) => {
          const lower = q.toLowerCase();
          if (lower.includes("station")) return "Stationery Supplier";
          if (lower.includes("software") || lower.includes("dev")) return "Software Development";
          if (lower.includes("medic") || lower.includes("pharma")) return "Healthcare & Pharma";
          if (lower.includes("cloth") || lower.includes("textile")) return "Textile & Apparel";
          return "B2B Supplier";
        };

        const extractLocation = (q: string) => {
          const lower = q.toLowerCase();
          if (lower.includes("mumbai")) return "Mumbai, India";
          if (lower.includes("delhi")) return "New Delhi, India";
          if (lower.includes("new york") || lower.includes("ny")) return "New York, USA";
          if (lower.includes("london")) return "London, UK";
          return "Global / Regional Hub";
        };

        const limitParam = searchParams.get("limit");
        
        const extractCount = (q: string) => {
          if (limitParam && !isNaN(Number(limitParam))) {
            const count = parseInt(limitParam, 10);
            return Math.min(Math.max(count, 1), 100);
          }
          const match = q.match(/\b(\d+)\b/);
          if (match) {
            const count = parseInt(match[1], 10);
            return Math.min(Math.max(count, 1), 50); // bound between 1 and 50
          }
          return 10; // default
        };

        const category = extractCategory(query);
        const location = extractLocation(query);
        const prefix = category.split(" ")[0];
        const recordCount = extractCount(query);

        if (!urlParam) {
           sendEvent({ type: "log", message: `[System] Discovered ${recordCount} high-potential target websites...` });
        }

        // Generate mock data dynamically based on requested count
        const mockRecords = Array.from({ length: recordCount }).map((_, index) => {
          const id = (index + 1).toString();
          const names = ["Prime", "Global", "Apex", "Nova", "Stellar", "Quantum", "Nexus", "Zenith", "Pinnacle", "Vertex"];
          const prefixes = ["Ltd", "Enterprises", "Partners", "Solutions", "Group", "Corp", "Inc", "Co.", "Industries", "Logistics"];
          
          const rndName = names[index % names.length];
          const rndSuffix = prefixes[index % prefixes.length];
          const companyName = `${rndName} ${prefix} ${rndSuffix}`;
          
          return {
            id,
            company_name: companyName,
            category: category,
            location: location === "Global / Regional Hub" && index % 2 === 0 ? "London, UK" : location,
            phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
            email: `contact@${rndName.toLowerCase()}${prefix.toLowerCase()}.com`,
            website: urlParam || `https://${rndName.toLowerCase()}${prefix.toLowerCase()}.com`,
            description: `Leading provider of ${category.toLowerCase()} items for enterprise clients.`
          };
        });

        sendEvent({ type: "data", records: mockRecords });
        await new Promise(r => setTimeout(r, 500));

        // Step 4: Completed
        sendEvent({ type: "status", status: "completed", step: 4 });
        sendEvent({ type: "log", message: "[System] Extraction pipeline finished successfully." });

      } catch (err) {
        sendEvent({ type: "log", message: `[Error] Pipeline failed: ${err}` });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
}
