/*
  # Project Invitations Schema

  1. New Tables
    - `project_invitations`
      - `id` (uuid, primary key)
      - `project_id` (text, not null)
      - `inviter_email` (text, not null)
      - `invitee_email` (text, not null)
      - `status` (text, not null)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `project_invitations` table
    - Add policies for authenticated users
*/

-- Create the project_invitations table
CREATE TABLE IF NOT EXISTS project_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id text NOT NULL,
  inviter_email text NOT NULL,
  invitee_email text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own invitations"
  ON project_invitations
  FOR SELECT
  TO authenticated
  USING (
    auth.email() = invitee_email OR
    auth.email() = inviter_email
  );

CREATE POLICY "Users can create invitations"
  ON project_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.email() = inviter_email);

CREATE POLICY "Users can update their own invitations"
  ON project_invitations
  FOR UPDATE
  TO authenticated
  USING (auth.email() = invitee_email)
  WITH CHECK (auth.email() = invitee_email);

-- Create function to handle invitation updates
CREATE OR REPLACE FUNCTION handle_invitation_response()
RETURNS TRIGGER AS $$
BEGIN
  -- Send notification email when invitation is created
  IF (TG_OP = 'INSERT') THEN
    PERFORM net.http_post(
      url := 'https://api.sendgrid.com/v3/mail/send',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.sendgrid_key'),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'personalizations', jsonb_build_array(
          jsonb_build_object(
            'to', jsonb_build_array(
              jsonb_build_object(
                'email', NEW.invitee_email
              )
            )
          )
        ),
        'from', jsonb_build_object(
          'email', 'noreply@yourdomain.com'
        ),
        'subject', 'You have been invited to collaborate',
        'content', jsonb_build_array(
          jsonb_build_object(
            'type', 'text/html',
            'value', format(
              'You have been invited by %s to collaborate on a project. Click here to accept: %s',
              NEW.inviter_email,
              current_setting('app.frontend_url') || '/invitations/' || NEW.id
            )
          )
        )
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invitation notifications
CREATE TRIGGER invitation_notification
  AFTER INSERT ON project_invitations
  FOR EACH ROW
  EXECUTE FUNCTION handle_invitation_response();

-- Create index for faster lookups
CREATE INDEX idx_project_invitations_emails 
  ON project_invitations(inviter_email, invitee_email);