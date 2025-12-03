import React from 'react';
   import { TopRiskUser } from '../../types/dashboard.types';
   import { formatRiskScore, getSeverityColor, getRiskLevel } from '../../utils/formatters';
   import styles from './Dashboard.module.css';

   interface TopRisksTableProps {
     users: TopRiskUser[];
   }

   export const TopRisksTable: React.FC<TopRisksTableProps> = ({ users }) => {
     return (
       <div className={styles.card}>
         <div className={styles.cardHeader}>
           <h2 className={styles.cardTitle}>Top Risk Users</h2>
         </div>

         <div className={styles.tableContainer}>
           {users.length === 0 ? (
             <div className={styles.emptyState}>
               <p>No risk data available</p>
             </div>
           ) : (
             <table className={styles.table}>
               <thead>
                 <tr>
                   <th>User</th>
                   <th>Max Risk Score</th>
                   <th>Avg Risk Score</th>
                   <th>Anomalies</th>
                   <th>Total Logins</th>
                   <th>Status</th>
                 </tr>
               </thead>
               <tbody>
                 {users.map((user) => {
                   const riskLevel = getRiskLevel(user.max_risk_score);
                   return (
                     <tr key={user.user_id}>
                       <td>
                         <div className={styles.userCell}>
                           <span className={styles.userIcon}>👤</span>
                           <div>
                             <div className={styles.username}>{user.username}</div>
                             <div className={styles.userId}>{user.user_id}</div>
                           </div>
                         </div>
                       </td>
                       <td>
                         <span className={styles.riskScore}>
                           {formatRiskScore(user.max_risk_score)}
                         </span>
                       </td>
                       <td>
                         <span className={styles.riskScore}>
                           {formatRiskScore(user.avg_risk_score)}
                         </span>
                       </td>
                       <td>
                         <span className={styles.anomalyCount}>
                           {user.anomaly_count}
                         </span>
                       </td>
                       <td>{user.total_logins}</td>
                       <td>
                         <span
                           className={styles.statusBadge}
                           style={{ backgroundColor: getSeverityColor(riskLevel) }}
                         >
                           {riskLevel.toUpperCase()}
                         </span>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           )}
         </div>
       </div>
     );
   };

   export default TopRisksTable;