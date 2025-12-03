/**
 * Auto-import books on first run
 * FIXED: Now uses Supabase Edge Function (server-side, no CORS issues)
 */
import { supabase } from "@/integrations/supabase/client";

/**
 * Check import status from server (not localStorage)
 */
export async function checkImportStatus(): Promise<'pending' | 'in_progress' | 'complete'> {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('config_value')
      .eq('config_key', 'book_import_status')
      .maybeSingle();
    
    if (error) {
      console.error('Error checking import status:', error);
      return 'pending';
    }
    
    return (data?.config_value as 'pending' | 'in_progress' | 'complete') || 'pending';
  } catch (error) {
    console.error('Error checking import status:', error);
    return 'pending';
  }
}

/**
 * Trigger server-side bulk import via Edge Function
 * NON-BLOCKING - Returns immediately, import happens in background
 */
export async function triggerBulkImport(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🚀 Triggering server-side bulk import...');
    
    const { data, error } = await supabase.functions.invoke('import-books', {
      body: { action: 'import_all_content' }
    });
    
    if (error) {
      console.error('❌ Error invoking import function:', error);
      return { 
        success: false, 
        message: `Failed to start import: ${error.message}` 
      };
    }
    
    if (data.success) {
      console.log(`✅ Import completed: ${data.imported} books imported, ${data.failed} failed`);
      return { 
        success: true, 
        message: `Successfully imported ${data.imported} books` 
      };
    } else {
      console.log(`⚠️ Import result: ${data.message || 'Unknown status'}`);
      return { 
        success: true, 
        message: data.message || 'Import process completed' 
      };
    }
  } catch (error: any) {
    console.error('❌ Error triggering bulk import:', error);
    return { 
      success: false, 
      message: `Error: ${error.message}` 
    };
  }
}

/**
 * FULLY AUTOMATIC SETUP (FIXED VERSION)
 * Checks server-side status and triggers Edge Function if needed
 * Non-blocking - import happens on server, not in browser
 */
export async function autoImportBooksOnFirstRun(): Promise<void> {
  try {
    console.log('📚 Checking book import status...');
    
    // Check server-side status (not localStorage)
    const status = await checkImportStatus();
    
    if (status === 'complete') {
      console.log('✅ Books already imported');
      return;
    }
    
    if (status === 'in_progress') {
      console.log('⏳ Import already in progress');
      return;
    }
    
    // Status is 'pending' - trigger import
    console.log('🚀 Starting server-side book import...');
    
    // Trigger Edge Function (non-blocking)
    const result = await triggerBulkImport();
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
      
      // Dispatch completion event for UI
      window.dispatchEvent(new CustomEvent('book-import-complete', {
        detail: { message: result.message }
      }));
    } else {
      console.error(`❌ ${result.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error during auto-setup:', error);
  }
}

/**
 * Get import progress (for UI display)
 */
export async function getImportProgress(): Promise<{ current: number; total: number; errors: any[] } | null> {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('config_value')
      .eq('config_key', 'book_import_progress')
      .maybeSingle();
    
    if (error || !data) {
      return null;
    }
    
    return JSON.parse(data.config_value);
  } catch (error) {
    console.error('Error getting import progress:', error);
    return null;
  }
}

/**
 * Force re-import (for admin use)
 */
export async function resetImportFlag() {
  try {
    const { error } = await supabase
      .from('system_config')
      .update({ config_value: 'pending' })
      .eq('config_key', 'book_import_status');
    
    if (error) {
      console.error('Error resetting import flag:', error);
    } else {
      console.log('🔄 Import flag reset - books will be imported on next trigger');
    }
  } catch (error) {
    console.error('Error resetting import flag:', error);
  }
}
