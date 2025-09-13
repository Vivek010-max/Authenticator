import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContex';
import axios from '../../axios';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Mail,
  Lock
} from 'lucide-react';

const InstituteManagement = () => {
  const { currentUser } = useAuth();
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [newInstitute, setNewInstitute] = useState({
    name: '',
    email: '',
    contactPerson: '',
    phone: '',
    address: '',
    type: 'university'
  });

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/admin/institutes');
      setInstitutes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching institutes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstitute = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/v1/admin/institutes', newInstitute);
      if (response.data.success) {
        setShowAddModal(false);
        setNewInstitute({
          name: '',
          email: '',
          contactPerson: '',
          phone: '',
          address: '',
          type: 'university'
        });
        fetchInstitutes();
      }
    } catch (error) {
      console.error('Error adding institute:', error);
    }
  };

  const handleDeleteInstitute = async (instituteId) => {
    if (window.confirm('Are you sure you want to delete this institute?')) {
      try {
        await axios.delete(`/api/v1/admin/institutes/${instituteId}`);
        fetchInstitutes();
      } catch (error) {
        console.error('Error deleting institute:', error);
      }
    }
  };

  const handleGenerateCredentials = async (instituteId) => {
    try {
      const response = await axios.post(`/api/v1/admin/institutes/${instituteId}/generate-credentials`);
      if (response.data.success) {
        alert('Credentials generated successfully!');
      }
    } catch (error) {
      console.error('Error generating credentials:', error);
    }
  };

  const filteredInstitutes = institutes.filter(institute =>
    institute.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institute.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institute.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading institutes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Institute Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage all registered institutes and their credentials
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Institute</span>
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search institutes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              />
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>

        {/* Institutes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstitutes.map((institute) => (
            <Card key={institute._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{institute.name}</CardTitle>
                      <p className="text-sm text-gray-500">{institute.type}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedInstitute(institute)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{institute.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{institute.contactPerson}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      institute.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {institute.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleGenerateCredentials(institute._id)}
                    className="flex-1"
                  >
                    <Lock className="h-4 w-4 mr-1" />
                    Generate Credentials
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedInstitute(institute)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredInstitutes.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No institutes found
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first institute'}
            </p>
          </div>
        )}

        {/* Add Institute Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add New Institute</h3>
              <form onSubmit={handleAddInstitute} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Institute Name</label>
                  <input
                    type="text"
                    value={newInstitute.name}
                    onChange={(e) => setNewInstitute({...newInstitute, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={newInstitute.email}
                    onChange={(e) => setNewInstitute({...newInstitute, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newInstitute.contactPerson}
                    onChange={(e) => setNewInstitute({...newInstitute, contactPerson: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newInstitute.phone}
                    onChange={(e) => setNewInstitute({...newInstitute, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    value={newInstitute.address}
                    onChange={(e) => setNewInstitute({...newInstitute, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    value={newInstitute.type}
                    onChange={(e) => setNewInstitute({...newInstitute, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="university">University</option>
                    <option value="college">College</option>
                    <option value="institute">Institute</option>
                    <option value="school">School</option>
                  </select>
                </div>
                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    Add Institute
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstituteManagement;
