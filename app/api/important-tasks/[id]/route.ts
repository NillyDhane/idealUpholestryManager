import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// DELETE handler - soft delete by marking task as deleted
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('DELETE /api/important-tasks/:id called for id:', params.id);
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // This is a soft delete - we just mark it as is_completed
    // We could also add a separate is_deleted flag if needed
    const { data, error } = await supabase
      .from('important_tasks')
      .update({ is_completed: true })
      .eq('id', params.id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Task deleted successfully (soft delete):', params.id);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}

// PATCH handler - update task (used for marking as complete)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('PATCH /api/important-tasks/:id called for id:', params.id);
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get the update data from request
    const body = await request.json();
    console.log('Update task data:', body);
    
    const { data, error } = await supabase
      .from('important_tasks')
      .update(body)
      .eq('id', params.id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Task updated successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
} 