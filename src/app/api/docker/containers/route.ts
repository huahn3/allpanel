import { NextResponse } from 'next/server'
import { getAllContainers } from '../../../../../lib/docker'

export async function GET() {
  try {
    const containers = await getAllContainers()
    return NextResponse.json(containers)
  } catch (error) {
    console.error('Docker containers API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch containers' },
      { status: 500 }
    )
  }
}
