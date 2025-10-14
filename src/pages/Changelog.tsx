import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, Bug, Wrench, AlertTriangle, Star } from 'lucide-react';

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  changes: {
    type: 'feature' | 'bugfix' | 'improvement' | 'upcoming' | 'deprecation';
    title: string;
    description?: string;
  }[];
}

const changelogData: ChangelogEntry[] = [
  {
    version: '1.3',
    date: '15 March 2025',
    type: 'minor',
    changes: [
      {
        type: 'feature',
        title: 'Enhanced CVE Search Experience',
        description: 'Improved CVE search with better filtering, pagination, and user interface'
      },
      {
        type: 'feature',
        title: 'Dynamic Copyright Year',
        description: 'Footer now automatically updates to show current year'
      },
      {
        type: 'feature',
        title: 'Changelog Page',
        description: 'New dedicated changelog page to track all version updates and improvements'
      },
      {
        type: 'improvement',
        title: 'Better Error Handling',
        description: 'Enhanced error handling for API connections and data loading'
      },
      {
        type: 'improvement',
        title: 'UI/UX Improvements',
        description: 'Refined user interface with better spacing, responsive design, and visual consistency'
      },
      {
        type: 'bugfix',
        title: 'Dashboard Data Display Fixed',
        description: 'Fixed dashboard showing zeros by correcting API field mapping'
      },
      {
        type: 'bugfix',
        title: 'CVE Search Parameter Issues',
        description: 'Resolved duplicate API parameters and pagination synchronization issues'
      }
    ]
  },
  {
    version: '1.2',
    date: '10 March 2025',
    type: 'minor',
    changes: [
      {
        type: 'feature',
        title: 'eXpose Finder Implemented',
        description: 'Advanced vulnerability discovery and management system'
      },
      {
        type: 'feature',
        title: 'CVE Search Integration',
        description: 'Integrated National Vulnerability Database (NVD) CVE search with advanced filtering capabilities'
      },
      {
        type: 'feature',
        title: 'Real-time CVE Monitoring',
        description: 'Monitor recent CVEs with date range filtering and severity-based search'
      },
      {
        type: 'feature',
        title: 'CVE Details Modal',
        description: 'Comprehensive CVE information display with CVSS scores, descriptions, and references'
      },
      {
        type: 'bugfix',
        title: 'UI Issue Fixed',
        description: 'Resolved various UI inconsistencies and layout issues'
      },
      {
        type: 'improvement',
        title: 'Dashboard Layout Consistency',
        description: 'Standardized page layouts and spacing across all components'
      },
      {
        type: 'improvement',
        title: 'Mobile Responsiveness',
        description: 'Enhanced mobile experience for CVE search and dashboard components'
      },
      {
        type: 'deprecation',
        title: 'Vulnerability Scanner Temporarily Disabled',
        description: 'Due to compatibility issues, the Vulnerability Scanner feature has been temporarily disabled. We are working on resolving these issues for future releases.'
      }
    ]
  },
  {
    version: '1.1',
    date: '20 August 2024',
    type: 'major',
    changes: [
      {
        type: 'feature',
        title: 'Schedule Scan',
        description: 'Automated vulnerability scanning with customizable schedules'
      },
      {
        type: 'feature',
        title: 'Notifications System',
        description: 'Real-time notifications for scan results and system updates'
      },
      {
        type: 'bugfix',
        title: 'Button Color Issue Fixed',
        description: 'Resolved inconsistent button styling across the application'
      },
      {
        type: 'bugfix',
        title: 'Random Profile Picture Issue Fixed',
        description: 'Fixed profile picture display inconsistencies'
      },
      {
        type: 'improvement',
        title: 'Hide/Show Feature for Vulnerability Report',
        description: 'Enhanced report viewing with collapsible sections'
      },
      {
        type: 'improvement',
        title: 'Full Screen Image Viewer for Vulnerability Report',
        description: 'Improved image viewing experience in vulnerability reports'
      },
      {
        type: 'upcoming',
        title: 'Multiple Language Support',
        description: 'Internationalization support for multiple languages (Coming Soon)'
      }
    ]
  },
  {
    version: '1.0',
    date: '15 August 2024',
    type: 'major',
    changes: [
      {
        type: 'feature',
        title: 'Agent Management',
        description: 'Complete agent lifecycle management system'
      },
      {
        type: 'feature',
        title: 'Vulnerability Scanner',
        description: 'Comprehensive vulnerability scanning engine (Currently disabled due to compatibility issues)'
      },
      {
        type: 'feature',
        title: 'Vulnerability Management',
        description: 'End-to-end vulnerability tracking and remediation workflow'
      },
      {
        type: 'feature',
        title: 'Report Generation',
        description: 'Automated report generation with customizable templates'
      },
      {
        type: 'feature',
        title: 'User Management',
        description: 'Role-based access control and user administration'
      },
      {
        type: 'feature',
        title: 'Two-Factor Authentication (2FA)',
        description: 'Enhanced security with 2FA implementation'
      },
      {
        type: 'improvement',
        title: 'Dashboard for Vulnerability Scanner',
        description: 'Dedicated dashboard for scanner status and results'
      },
      {
        type: 'improvement',
        title: 'Dashboard for Vulnerability Management',
        description: 'Comprehensive management dashboard with analytics'
      },
      {
        type: 'improvement',
        title: 'Map Integration for Vulnerability Scanner',
        description: 'Geographic visualization of vulnerability data'
      }
    ]
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'feature':
      return <Star className="w-4 h-4 text-green-600" />;
    case 'bugfix':
      return <Bug className="w-4 h-4 text-red-600" />;
    case 'improvement':
      return <Wrench className="w-4 h-4 text-blue-600" />;
    case 'upcoming':
      return <Calendar className="w-4 h-4 text-purple-600" />;
    case 'deprecation':
      return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    default:
      return <CheckCircle className="w-4 h-4 text-gray-600" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'feature':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'bugfix':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'improvement':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'upcoming':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'deprecation':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getVersionBadgeColor = (type: string) => {
  switch (type) {
    case 'major':
      return 'bg-red-600 text-white';
    case 'minor':
      return 'bg-blue-600 text-white';
    case 'patch':
      return 'bg-green-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
};

export default function Changelog() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Version History</h1>
            <p className="text-sm sm:text-base text-gray-600">Track all updates and improvements to WhyXpose</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Latest Version: V{changelogData[0].version}
          </Badge>
        </div>
      </div>

      {/* Changelog Entries */}
      <div className="space-y-6">
        {changelogData.map((entry, index) => (
          <Card key={entry.version} className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge className={getVersionBadgeColor(entry.type)}>
                    V{entry.version}
                  </Badge>
                  <div>
                    <CardTitle className="text-lg">
                      {entry.type === 'major' ? 'Major Update' : 
                       entry.type === 'minor' ? 'Minor Update' : 'Patch Update'}: {entry.version}
                    </CardTitle>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {entry.date}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {entry.changes.map((change, changeIndex) => (
                  <div key={changeIndex} className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(change.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getTypeColor(change.type)}`}
                        >
                          {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
                        </Badge>
                        <span className="font-medium text-gray-900">{change.title}</span>
                      </div>
                      {change.description && (
                        <p className="text-sm text-gray-600 ml-0">{change.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Footer Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Important Notice</h3>
              <p className="text-sm text-blue-800">
                The Vulnerability Scanner feature is currently disabled due to compatibility issues. 
                Our development team is actively working on resolving these issues. 
                We apologize for any inconvenience and appreciate your patience.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
