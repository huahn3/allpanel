import { NextResponse } from 'next/server'
import { testDockerConnection } from '../../../../../lib/docker'

export async function GET() {
  try {
    const connectionTest = await testDockerConnection()
    
    if (connectionTest.success) {
      return NextResponse.json({ 
        connected: true, 
        message: 'Docker connection successful' 
      })
    } else {
      return NextResponse.json({ 
        connected: false, 
        error: connectionTest.error,
        message: 'Docker connection failed'
      }, { status: 503 })
    }
  } catch (error) {
    console.error('Docker status API error:', error)
    return NextResponse.json(
      { 
        connected: false,
        error: 'Failed to check Docker status',
        message: 'Docker status check failed'
      },
      { status: 500 }
    )
  }
}
