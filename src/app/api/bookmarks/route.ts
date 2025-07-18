import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

export async function GET() {
  try {
    const bookmarks = await prisma.bookmark.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json(bookmarks)
  } catch (error) {
    console.error('Bookmarks GET API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, url, description, category, icon } = body

    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      )
    }

    // 获取当前最大order值
    const maxOrder = await prisma.bookmark.aggregate({
      _max: { order: true }
    })

    const bookmark = await prisma.bookmark.create({
      data: {
        title,
        url,
        description,
        category: category || 'default',
        icon,
        order: (maxOrder._max.order || 0) + 1
      }
    })

    return NextResponse.json(bookmark)
  } catch (error) {
    console.error('Bookmarks POST API error:', error)
    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    )
  }
}
