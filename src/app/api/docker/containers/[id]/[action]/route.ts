import { NextRequest, NextResponse } from 'next/server'
import { startContainer, stopContainer, restartContainer } from '../../../../../../../lib/docker'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const { id, action } = await params

    let result
    switch (action) {
      case 'start':
        result = await startContainer(id)
        break
      case 'stop':
        result = await stopContainer(id)
        break
      case 'restart':
        result = await restartContainer(id)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Docker action API error:', error)
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    )
  }
}
