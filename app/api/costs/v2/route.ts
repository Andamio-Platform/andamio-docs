"use server";

import { addCorsHeaders, createOptionsResponse } from "@/utils/cors";
import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * V2 Cost Registry API Route
 *
 * Serves transaction cost estimates from the V2 cost registry.
 *
 * Endpoints:
 *   GET /api/costs/v2              - Full cost registry
 *   GET /api/costs/v2?tx=<id>      - Single transaction cost (e.g., tx=course.student.enroll)
 *   GET /api/costs/v2?loop=<name>  - Loop cost summary (e.g., loop=single-credential)
 *
 * Example responses:
 *   GET /api/costs/v2?tx=course.student.enroll
 *   {
 *     "transaction": "course.student.enroll",
 *     "txFee": 402798,
 *     "txFeeAda": "~0.40 ADA",
 *     "serviceFee": 0,
 *     "walletDelta": { "lovelace": 2140000, "ada": "~2.14 ADA", ... }
 *   }
 *
 *   GET /api/costs/v2?loop=single-credential
 *   {
 *     "loop": "single-credential",
 *     "description": "Complete loop: enroll → commit assignment → assess → claim credential",
 *     "totalLoopCost": "~1.32 ADA",
 *     "participants": { ... }
 *   }
 */

interface CostRegistry {
  version: string;
  lastUpdated: string;
  network: string;
  notes?: string[];
  treasuries?: Record<string, unknown>;
  serviceFees?: Record<string, unknown>;
  transactionCosts: Record<string, unknown>;
  minUtxoByType?: Record<string, unknown>;
  loops?: Record<string, unknown>;
}

function loadCostRegistry(): CostRegistry {
  const filePath = join(process.cwd(), "public", "yaml", "transactions", "v2", "cost-registry.json");
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const txId = searchParams.get("tx");
    const loopName = searchParams.get("loop");
    const summary = searchParams.get("summary") === "true";

    const registry = loadCostRegistry();

    let responseData: unknown;

    if (txId) {
      // Return single transaction cost
      const txCost = registry.transactionCosts[txId];
      if (!txCost) {
        return NextResponse.json(
          {
            error: "Transaction not found",
            available: Object.keys(registry.transactionCosts)
          },
          { status: 404 }
        );
      }
      responseData = {
        transaction: txId,
        ...txCost as object,
      };
    } else if (loopName) {
      // Return loop cost summary
      const loop = registry.loops?.[loopName];
      if (!loop) {
        return NextResponse.json(
          {
            error: "Loop not found",
            available: registry.loops ? Object.keys(registry.loops) : []
          },
          { status: 404 }
        );
      }
      responseData = {
        loop: loopName,
        ...loop as object,
      };
    } else if (summary) {
      // Return summary of all transaction costs
      const costs = Object.entries(registry.transactionCosts).map(([id, cost]) => {
        const c = cost as Record<string, unknown>;
        const walletDelta = c.walletDelta as Record<string, unknown> | undefined;
        return {
          id,
          txFeeAda: c.txFeeAda,
          serviceFeeAda: c.serviceFeeAda || "0 ADA",
          walletDeltaAda: walletDelta?.ada || "unknown",
        };
      });

      responseData = {
        version: registry.version,
        lastUpdated: registry.lastUpdated,
        network: registry.network,
        transactionCount: costs.length,
        transactions: costs,
        loops: registry.loops ? Object.keys(registry.loops) : [],
      };
    } else {
      // Return full registry
      responseData = registry;
    }

    const response = NextResponse.json(responseData);
    addCorsHeaders(response, request);
    return response;

  } catch (error) {
    console.error("Error loading cost registry:", error);
    return NextResponse.json(
      { error: "Failed to load cost registry", details: String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return createOptionsResponse(request);
}
