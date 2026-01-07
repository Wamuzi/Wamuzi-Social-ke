import React, { useState, useEffect } from 'react';
import { Report, User, Post } from '../types';
import { socialService } from '../services/socialService';
import { userService } from '../services/userService';
import { FlagIcon, CheckIcon } from './icons/Icons';

const AdminReportsView: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);

    useEffect(() => {
        const updateReports = () => setReports(socialService.getPendingReports());
        updateReports();
        socialService.subscribe(updateReports); // Subscribing to socialService for real-time updates
        userService.subscribe(updateReports);   // Subscribing to userService for real-time updates
        return () => {
            socialService.unsubscribe(updateReports);
            userService.unsubscribe(updateReports);
        }
    }, []);

    const handleDismiss = (reportId: string) => {
        socialService.updateReportStatus(reportId, 'reviewed');
    };
    
    const handleSuspendUser = (userId: string, associatedReportId: string) => {
        if(window.confirm('Are you sure you want to suspend this user?')) {
            userService.suspendUser(userId);
            handleDismiss(associatedReportId); // Automatically dismiss the report
        }
    }

    const handleDeletePost = (postId: string, associatedReportId: string) => {
        if(window.confirm('Are you sure you want to delete this post?')) {
            socialService.deletePost(postId);
            handleDismiss(associatedReportId); // Automatically dismiss the report
        }
    }

    const ReportedContent: React.FC<{ report: Report }> = ({ report }) => {
        if (report.contentType === 'post') {
            const post = socialService.getPostById(report.contentId);
            if (!post) return <p className="text-sm text-red-500 italic">[Content has been deleted]</p>;
            return (
                <div className="p-2 bg-gray-100 rounded-md mt-1 border-l-4 border-red-300">
                    <p className="text-sm text-gray-700">{post.content}</p>
                    <p className="text-xs text-gray-500 mt-1">Post by {post.author.name}</p>
                </div>
            );
        }
        if (report.contentType === 'profile') {
            const user = userService.getUserById(report.contentId);
            if (!user) return <p className="text-sm text-red-500 italic">[User has been deleted]</p>;
            return (
                 <div className="p-2 bg-gray-100 rounded-md mt-1 border-l-4 border-red-300">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-gray-600">{user.bio}</p>
                </div>
            )
        }
        return null;
    };

    return (
        <div className="bg-white shadow-md rounded-lg">
            <div className="p-4 border-b">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <FlagIcon className="w-5 h-5 text-red-500"/> User Reports
                </h3>
                <p className="text-sm text-gray-500">Review content reported by users.</p>
            </div>
             <div className="space-y-3 p-4 max-h-[70vh] overflow-y-auto">
                {reports.length > 0 ? (
                    reports.map(report => {
                        const reporter = userService.getUserById(report.reporterId);
                        const contentAuthor = userService.getUserById(report.contentAuthorId);

                        return (
                            <div key={report.id} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">{reporter?.name || 'Unknown User'} reported a {report.contentType}</p>
                                        <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleDismiss(report.id)} className="flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-md hover:bg-green-200 transition" title="Mark as Reviewed">
                                            <CheckIcon className="w-4 h-4" /> Dismiss
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <p className="text-sm font-medium">Reason:</p>
                                    <p className="text-sm p-2 bg-white border rounded-md">{report.reason}</p>
                                </div>
                                <div className="mt-2">
                                     <p className="text-sm font-medium">Reported Content:</p>
                                    <ReportedContent report={report} />
                                </div>
                                {contentAuthor && (
                                    <div className="mt-3 pt-3 border-t flex items-center gap-2">
                                        <p className="text-sm font-medium">Actions:</p>
                                        <button onClick={() => handleSuspendUser(contentAuthor.id, report.id)} className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200">
                                            Suspend User ({contentAuthor.name})
                                        </button>
                                        {report.contentType === 'post' && (
                                            <button onClick={() => handleDeletePost(report.contentId, report.id)} className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                                                Delete Post
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })
                ) : (
                     <p className="text-center text-gray-500 py-8">No pending reports.</p>
                )}
            </div>
        </div>
    );
};

export default AdminReportsView;