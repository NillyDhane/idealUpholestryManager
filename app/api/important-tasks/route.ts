import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('GET /api/important-tasks called');
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get only active (not completed) tasks with proper sorting by due date
    const { data: tasks, error } = await supabase
      .from('important_tasks')
      .select('*')
      .eq('is_completed', false)  // Only get tasks that aren't completed
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    // Ensure we're returning an array even if data is null
    const tasksArray = tasks || [];
    
    console.log('Tasks fetched successfully:', tasksArray.length, 'tasks');
    if (tasksArray.length > 0) {
      console.log('Sample task:', tasksArray[0]);
    }
    
    return NextResponse.json(tasksArray);
  } catch (error) {
    console.error('Error fetching important tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch important tasks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('POST /api/important-tasks called');
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const body = await request.json();
    
    console.log('Creating task with data:', {
      title: body.title,
      van_number: body.van_number,
      customer_name: body.customer_name,
      issue: body.issue,
      warranty_handled_by: body.warranty_handled_by,
      assigned_to: body.assigned_to,
      due_date: body.due_date,
      is_completed: false // Ensure new tasks start as not completed
    });

    const { data: task, error } = await supabase
      .from('important_tasks')
      .insert([
        {
          title: body.title,
          van_number: body.van_number,
          customer_name: body.customer_name,
          issue: body.issue,
          warranty_handled_by: body.warranty_handled_by,
          assigned_to: body.assigned_to,
          due_date: body.due_date,
          is_completed: false // Ensure new tasks start as not completed
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    console.log('Task created successfully:', task);
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error creating important task:', error);
    return NextResponse.json(
      { error: 'Failed to create important task' },
      { status: 500 }
    );
  }
} 