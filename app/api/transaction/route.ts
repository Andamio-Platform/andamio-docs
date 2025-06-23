"use server";

import { loadYamlFile } from "@/utils/yaml";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const txFile = searchParams.get("file");

  if (!txFile) {
    return NextResponse.json(
      { error: "No file parameter provided" },
      { status: 400 }
    );
  }

  try {
    const txData = await loadYamlFile(`yaml/transactions/${txFile}`);
    return NextResponse.json(txData);
  } catch (error) {
    console.error("Error loading transaction file:", error);
    return NextResponse.json(
      { error: "Failed to load transaction file" },
      { status: 500 }
    );
  }
}
