'use client';

import styles from './page.module.css';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SuperAdminGate } from '@/lib/rbac';
import { PermissionAction } from '@/lib/rbac/types';

interface TestResult {
  test: string;
  result: boolean;
  details?: string;
}

export default function PermissionTestingPage() {
  const [userId, setUserId] = useState('');
  const [resourceName, setResourceName] = useState('events');
  const [action, setAction] = useState<PermissionAction>(PermissionAction.READ);
  const [eventId, setEventId] = useState('');
  const [permissionKey, setPermissionKey] = useState('can_view_financials');
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  async function runTests() {
    if (!userId) {
      alert('Please enter a user ID');
      return;
    }

    setTesting(true);
    setResults([]);
    const testResults: TestResult[] = [];

    try {
      const supabase = createClient();

      // Test 1: Check basic permission
      try {
        const { data: hasPermData, error: permError } = await supabase.rpc('has_permission', {
          p_user_id: userId,
          p_resource_name: resourceName,
          p_action: action,
          p_scope_context: {}
        });

        testResults.push({
          test: `has_permission('${resourceName}', '${action}')`,
          result: hasPermData === true,
          details: permError ? permError.message : `Permission: ${hasPermData ? 'GRANTED' : 'DENIED'}`
        });
      } catch (error: any) {
        testResults.push({
          test: `has_permission('${resourceName}', '${action}')`,
          result: false,
          details: `Error: ${error.message}`
        });
      }

      // Test 2: Check team member status
      try {
        const { data: isTeamData, error: teamError } = await supabase.rpc('is_team_member', {
          p_user_id: userId
        });

        testResults.push({
          test: 'is_team_member()',
          result: isTeamData === true,
          details: teamError ? teamError.message : `Team Member: ${isTeamData ? 'YES' : 'NO'}`
        });
      } catch (error: any) {
        testResults.push({
          test: 'is_team_member()',
          result: false,
          details: `Error: ${error.message}`
        });
      }

      // Test 3: Check super admin status
      try {
        const { data: isSuperData, error: superError } = await supabase.rpc('is_super_admin', {
          p_user_id: userId
        });

        testResults.push({
          test: 'is_super_admin()',
          result: isSuperData === true,
          details: superError ? superError.message : `Super Admin: ${isSuperData ? 'YES' : 'NO'}`
        });
      } catch (error: any) {
        testResults.push({
          test: 'is_super_admin()',
          result: false,
          details: `Error: ${error.message}`
        });
      }

      // Test 4: Get user roles
      try {
        const { data: userData, error: userError } = await supabase
          .from('user_profiles')
          .select('member_role, team_role, is_team_member')
          .eq('id', userId)
          .single();

        if (userData) {
          testResults.push({
            test: 'User Roles',
            result: true,
            details: `Member: ${userData.member_role}, Team: ${userData.team_role || 'None'}, Is Team: ${userData.is_team_member}`
          });
        } else {
          testResults.push({
            test: 'User Roles',
            result: false,
            details: userError?.message || 'User not found'
          });
        }
      } catch (error: any) {
        testResults.push({
          test: 'User Roles',
          result: false,
          details: `Error: ${error.message}`
        });
      }

      // Test 5: Check event permission (if eventId provided)
      if (eventId) {
        try {
          const { data: eventPermData, error: eventPermError } = await supabase.rpc('has_event_permission', {
            p_user_id: userId,
            p_event_id: eventId,
            p_permission_key: permissionKey
          });

          testResults.push({
            test: `has_event_permission('${permissionKey}')`,
            result: eventPermData === true,
            details: eventPermError ? eventPermError.message : `Event Permission: ${eventPermData ? 'GRANTED' : 'DENIED'}`
          });
        } catch (error: any) {
          testResults.push({
            test: `has_event_permission('${permissionKey}')`,
            result: false,
            details: `Error: ${error.message}`
          });
        }

        // Test 6: Get event role
        try {
          const { data: eventRoleData, error: eventRoleError } = await supabase.rpc('get_user_event_role', {
            p_user_id: userId,
            p_event_id: eventId
          });

          testResults.push({
            test: 'get_user_event_role()',
            result: eventRoleData !== null,
            details: eventRoleError ? eventRoleError.message : `Event Role: ${eventRoleData || 'None'}`
          });
        } catch (error: any) {
          testResults.push({
            test: 'get_user_event_role()',
            result: false,
            details: `Error: ${error.message}`
          });
        }

        // Test 7: Check active event assignment
        try {
          const { data: hasAssignmentData, error: assignmentError } = await supabase.rpc('has_active_event_assignment', {
            p_user_id: userId,
            p_event_id: eventId
          });

          testResults.push({
            test: 'has_active_event_assignment()',
            result: hasAssignmentData === true,
            details: assignmentError ? assignmentError.message : `Has Assignment: ${hasAssignmentData ? 'YES' : 'NO'}`
          });
        } catch (error: any) {
          testResults.push({
            test: 'has_active_event_assignment()',
            result: false,
            details: `Error: ${error.message}`
          });
        }
      }

      // Test 8: Check RLS policies
      try {
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id, title')
          .limit(5);

        testResults.push({
          test: 'RLS: Can read events table',
          result: !eventsError,
          details: eventsError ? eventsError.message : `Can read ${eventsData?.length || 0} events`
        });
      } catch (error: any) {
        testResults.push({
          test: 'RLS: Can read events table',
          result: false,
          details: `Error: ${error.message}`
        });
      }

      setResults(testResults);
    } catch (error: any) {
      console.error('Testing error:', error);
      testResults.push({
        test: 'Overall Test Suite',
        result: false,
        details: `Fatal error: ${error.message}`
      });
      setResults(testResults);
    } finally {
      setTesting(false);
    }
  }

  return (
    <SuperAdminGate fallback={<div className={styles.card}><p >Access Denied: Super Admin Only</p></div>}>
      <div className={styles.section}>
        <h1 className={styles.title}>Permission Testing Tool</h1>

        <div className={styles.card}>
          <h2 className={styles.label}>Test Configuration</h2>
          
          <div className={styles.grid}>
            <div>
              <label htmlFor="user-id" className={styles.label}>
                User ID (Required)
              </label>
              <input
                id="user-id"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user UUID"
                className={styles.input}
              />
            </div>

            <div>
              <label htmlFor="resource-name" className={styles.label}>
                Resource Name
              </label>
              <input
                id="resource-name"
                type="text"
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                placeholder="e.g., events, orders"
                className={styles.input}
              />
            </div>

            <div>
              <label htmlFor="action" className={styles.label}>
                Permission Action
              </label>
              <select
                id="action"
                value={action}
                onChange={(e) => setAction(e.target.value as PermissionAction)}
                className={styles.input}
              >
                <option value={PermissionAction.CREATE}>create</option>
                <option value={PermissionAction.READ}>read</option>
                <option value={PermissionAction.UPDATE}>update</option>
                <option value={PermissionAction.DELETE}>delete</option>
                <option value={PermissionAction.MANAGE}>manage</option>
              </select>
            </div>

            <div>
              <label htmlFor="event-id" className={styles.label}>
                Event ID (Optional)
              </label>
              <input
                id="event-id"
                type="text"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                placeholder="Enter event UUID for event-specific tests"
                className={styles.input}
              />
            </div>

            <div>
              <label htmlFor="permission-key" className={styles.label}>
                Event Permission Key (for event tests)
              </label>
              <input
                id="permission-key"
                type="text"
                value={permissionKey}
                onChange={(e) => setPermissionKey(e.target.value)}
                placeholder="e.g., can_view_financials, can_scan_tickets"
                className={styles.input}
              />
            </div>
          </div>

          <button
            onClick={runTests}
            disabled={testing || !userId}
            className={styles.button}
          >
            {testing ? 'Running Tests...' : 'Run Permission Tests'}
          </button>
        </div>

        {results.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.label}>Test Results</h2>
            
            <div className={styles.section}>
              {results.map((result, index) => (
                <div
                  key={index}
                  className={styles.card}
                >
                  <div className={styles.row}>
                    <h3 className={styles.textGrey600}>{result.test}</h3>
                    <span
                      className={styles.badge}
                    >
                      {result.result ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                  {result.details && (
                    <p className={styles.subtitle}>{result.details}</p>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.card}>
              <h3 className={styles.label}>Summary</h3>
              <p className={styles.text}>
                Passed: {results.filter(r => r.result).length} / {results.length}
              </p>
            </div>
          </div>
        )}

        <div className={styles.card}>
          <h3 className={styles.textGrey600}>Quick Tips</h3>
          <ul className={styles.section}>
            <li>• Use this tool to debug permission issues before they reach production</li>
            <li>• Test both positive and negative cases to ensure RLS policies work correctly</li>
            <li>• Event-specific tests require a valid Event ID</li>
            <li>• Check the browser console for detailed error messages</li>
            <li>• Common permission keys: can_view_financials, can_manage_content, can_scan_tickets</li>
          </ul>
        </div>
      </div>
    </SuperAdminGate>
  );
}
