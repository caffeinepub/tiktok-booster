import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '@/hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, User, Edit, Save, LogOut, KeyRound, Upload } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { identity, clear, isInitializing } = useInternetIdentity();
  const queryClient = useQueryClient();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();

  const [isEditMode, setIsEditMode] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const isAuthenticated = !!identity;
  const showLoginPrompt = !isInitializing && !isAuthenticated;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Populate form when profile loads
  useEffect(() => {
    if (userProfile) {
      setProfilePicture(userProfile.profilePicture || null);
      setUsername(userProfile.username || '');
      setBio(userProfile.bio || '');
      setEmail(userProfile.email || '');
      setPhone(userProfile.phone || '');
    }
  }, [userProfile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setProfilePicture(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async () => {
    if (!username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (phone && !/^\+?[\d\s\-()]+$/.test(phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    try {
      await saveProfileMutation.mutateAsync({
        profilePicture: profilePicture || undefined,
        username: username.trim(),
        bio: bio.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      setIsEditMode(false);
      toast.success('Profile saved successfully!', {
        description: 'Your changes have been saved',
      });
    } catch (error) {
      toast.error('Failed to save profile', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    toast.success('Logged out successfully', {
      description: 'You have been logged out',
    });
    navigate({ to: '/' });
  };

  const handleChangePassword = () => {
    const iiUrl = 'https://identity.ic0.app';
    window.open(iiUrl, '_blank', 'noopener,noreferrer');
    toast.info('Opening Internet Identity', {
      description: 'Manage your credentials in the new tab',
    });
  };

  if (showLoginPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Profile Access</CardTitle>
            <CardDescription>
              Please log in to view and manage your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <User className="w-16 h-16 text-muted-foreground" />
            <Button
              onClick={() => navigate({ to: '/' })}
              size="lg"
              className="w-full"
            >
              Go to Home & Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileLoading || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl sm:text-3xl">Profile</CardTitle>
                <CardDescription>
                  {isEditMode ? 'Edit your profile information' : 'View your profile information'}
                </CardDescription>
              </div>
              {!isEditMode && (
                <Button
                  onClick={() => setIsEditMode(true)}
                  variant="outline"
                  className="w-full sm:w-auto"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profilePicture || undefined} alt={username || 'User'} />
                <AvatarFallback className="text-3xl">
                  {username ? username.charAt(0).toUpperCase() : <User className="w-12 h-12" />}
                </AvatarFallback>
              </Avatar>
              {isEditMode && (
                <div className="flex flex-col items-center gap-2">
                  <Label
                    htmlFor="profile-picture"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Picture
                  </Label>
                  <Input
                    id="profile-picture"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">Max 5MB, JPG/PNG</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={!isEditMode}
                className={!isEditMode ? 'bg-muted' : ''}
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                disabled={!isEditMode}
                className={!isEditMode ? 'bg-muted' : ''}
                rows={4}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                disabled={!isEditMode}
                className={!isEditMode ? 'bg-muted' : ''}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                disabled={!isEditMode}
                className={!isEditMode ? 'bg-muted' : ''}
              />
            </div>

            {isEditMode && (
              <>
                <Separator />
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSaveChanges}
                    disabled={saveProfileMutation.isPending}
                    className="flex-1"
                    size="lg"
                  >
                    {saveProfileMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditMode(false);
                      // Reset to original values
                      if (userProfile) {
                        setProfilePicture(userProfile.profilePicture || null);
                        setUsername(userProfile.username || '');
                        setBio(userProfile.bio || '');
                        setEmail(userProfile.email || '');
                        setPhone(userProfile.phone || '');
                      }
                    }}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}

            {!isEditMode && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Button
                    onClick={handleChangePassword}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    <KeyRound className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Password management is handled through Internet Identity. Click above to manage your credentials in a new tab.
                  </p>

                  <Separator className="my-4" />

                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full"
                    size="lg"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
