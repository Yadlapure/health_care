from typing import Literal

import boto3
from botocore.config import Config
from botocore.exceptions import NoCredentialsError, PartialCredentialsError

from app.app_bundle.env_config_settings import get_settings


def generate_pre_signed_urls(
        bucket_name,
        object_name,
        type_of_req: Literal["both", "get", "put"],
        expiration=3600,
):
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=get_settings().config_s3_bucket,
        aws_secret_access_key=get_settings().aws_temp_ac_key,
        config=Config(signature_version="s3v4"),
        region_name="ap-south-1",
    )
    get_url, put_url = None, None
    try:
        if type_of_req == "get" or type_of_req == "both":
            get_url = s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": bucket_name, "Key": object_name},
                ExpiresIn=expiration,
            )
        if type_of_req == "put" or type_of_req == "both":
            put_url = s3_client.generate_presigned_url(
                "put_object",
                Params={"Bucket": bucket_name, "Key": object_name},
                ExpiresIn=expiration,
            )
    except (NoCredentialsError, PartialCredentialsError):
        return "Credentials not available"
    return get_url, put_url


def upload_to_s3(file_content, object_name: str, bucket_name: str):
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=get_settings().aws_temp_ac_key,
        aws_secret_access_key=get_settings().aws_temp_sc_key,
        config=Config(signature_version="s3v4"),
        region_name="ap-south-1",
    )
    try:
        s3_client.put_object(
            Bucket=bucket_name,
            Key=object_name,
            Body=file_content,
            ContentType="image/*",
        )
        return object_name
    except (NoCredentialsError, PartialCredentialsError):
        return "Credentials not available"