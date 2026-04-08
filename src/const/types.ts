export type Password = {
  username: string;
  password: string;
  id: number;
  created_at: string;
  platform: string;
};

export type PasswordInput = {
  username: string;
  encrypted_password: string;
  encrypted_key: string;
  iv_password: string;
  platform: string;
};
